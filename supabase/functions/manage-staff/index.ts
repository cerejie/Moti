// Creates staff accounts and resets their passwords. Runs with the service role,
// so every rule the database would enforce is checked here against the caller's
// own profile first: the superadmin manages any shop's owners and employees; an
// owner manages only employees of their own active shop.
import { createClient } from "npm:@supabase/supabase-js@2";

type StaffRole = "owner" | "employee";

type ICaller = {
  id: string;
  role: "superadmin" | "owner" | "employee";
  shop_id: string | null;
  is_active: boolean;
  shop: { is_active: boolean } | null;
};

type ITarget = {
  id: string;
  role: "superadmin" | "owner" | "employee";
  shop_id: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// No look-alike characters (0/O, 1/l/I), so it can be read out over the counter.
const passwordAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

const temporaryPassword = (length = 12) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => passwordAlphabet[byte % passwordAlphabet.length]).join("");
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const loadCaller = async (request: Request): Promise<ICaller> => {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) throw new RequestError(401, "Your session has expired. Sign in again.");

  const { data, error } = await admin
    .from("profiles")
    .select("id, role, shop_id, is_active, shop:shops(is_active)")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw new RequestError(500, error.message);

  const caller = data as ICaller | null;
  const active =
    caller?.is_active && (caller.role === "superadmin" || caller.shop?.is_active === true);
  if (!caller || !active || caller.role === "employee") {
    throw new RequestError(403, "You don't have permission to manage staff.");
  }
  return caller;
};

// The same rule update_staff_profile applies in the database.
const assertCanManage = (caller: ICaller, target: ITarget) => {
  if (target.id === caller.id) {
    throw new RequestError(403, "You can't change your own account here.");
  }
  const allowed =
    caller.role === "superadmin" ||
    (target.role === "employee" && target.shop_id === caller.shop_id);
  if (!allowed) throw new RequestError(403, "You don't have permission to change this user.");
};

const createStaff = async (caller: ICaller, body: Record<string, unknown>) => {
  const fullName = text(body.full_name);
  const email = text(body.email).toLowerCase();
  const role = text(body.role) as StaffRole;

  if (!fullName || fullName.length > 120) throw new RequestError(400, "Enter a name under 120 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError(400, "Enter a valid email address.");
  if (role !== "owner" && role !== "employee") throw new RequestError(400, "Choose owner or employee.");

  // An owner's staff always join the owner's own shop, whatever the client sent.
  const shopId = caller.role === "superadmin" ? text(body.shop_id) : caller.shop_id;
  if (caller.role !== "superadmin" && role !== "employee") {
    throw new RequestError(403, "Only the superadmin can add owners.");
  }
  if (!shopId) throw new RequestError(400, "Choose a shop.");

  const { data: shop, error: shopError } = await admin
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .maybeSingle();
  if (shopError) throw new RequestError(500, shopError.message);
  if (!shop) throw new RequestError(400, "That shop no longer exists.");

  const password = temporaryPassword();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, must_change_password: true },
  });
  if (createError || !created.user) {
    const taken = /already|exists|registered/i.test(createError?.message ?? "");
    throw new RequestError(
      taken ? 409 : 500,
      taken ? "A user with this email already exists." : createError?.message ?? "Couldn't create the account.",
    );
  }

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: created.user.id, shop_id: shopId, role, full_name: fullName });
  if (profileError) {
    // No half-made accounts: an auth user without a profile could never be managed.
    await admin.auth.admin.deleteUser(created.user.id);
    throw new RequestError(500, profileError.message);
  }

  return { user_id: created.user.id, full_name: fullName, email, temporary_password: password };
};

const resetPassword = async (caller: ICaller, body: Record<string, unknown>) => {
  const { data, error } = await admin
    .from("profiles")
    .select("id, role, shop_id, full_name, email")
    .eq("id", text(body.user_id))
    .maybeSingle();
  if (error) throw new RequestError(500, error.message);
  if (!data) throw new RequestError(404, "This user no longer exists.");

  const target = data as ITarget & { full_name: string; email: string | null };
  assertCanManage(caller, target);

  const password = temporaryPassword();
  const { error: updateError } = await admin.auth.admin.updateUserById(target.id, {
    password,
    user_metadata: { must_change_password: true },
  });
  if (updateError) throw new RequestError(500, updateError.message);

  return {
    user_id: target.id,
    full_name: target.full_name,
    email: target.email ?? "",
    temporary_password: password,
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });

  try {
    const caller = await loadCaller(request);
    const body = (await request.json()) as Record<string, unknown>;

    switch (body.action) {
      case "create":
        return reply(200, await createStaff(caller, body));
      case "reset_password":
        return reply(200, await resetPassword(caller, body));
      default:
        return reply(400, { error: "Unknown action." });
    }
  } catch (error) {
    if (error instanceof RequestError) return reply(error.status, { error: error.message });
    return reply(500, { error: error instanceof Error ? error.message : "Unexpected error." });
  }
});
