import type { ApprovalStatus } from "../../enums/role.enum";
import type {
  ICreateUserInput,
  ISetPasswordInput,
  UserView,
} from "../../models/data/user/user.request";
import type { IUser } from "../../models/data/user/user.response";
import { onlineOnly, supabase, toError } from "../../utils/supabase.utils";

const table = "users";
const columns =
  "id, email, full_name, role, approval_status, password_reset_requested_at, created_at";
const notChangedMessage = "Nothing changed — the account is gone or you can't manage it.";

// Account changes need the server's answer at once, so they are online-only
// rather than queued. RLS returns only the accounts the caller may manage.
const userServices = {
  getList: async (view: UserView, signal?: AbortSignal): Promise<IUser[]> => {
    let query = supabase.from(table).select(columns);
    if (view !== "all") query = query.eq("approval_status", view);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw toError(error);

    return (data ?? []) as IUser[];
  },

  create: async (values: ICreateUserInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("admin_create_user_email", {
        p_email: values.email,
        p_password: values.password,
        p_full_name: values.full_name,
        p_role: values.role,
      }),
    );
    if (error) throw toError(error);
  },

  setStatus: async (user: IUser, status: ApprovalStatus): Promise<void> => {
    const { data, error } = await onlineOnly(
      supabase.from(table).update({ approval_status: status }).eq("id", user.id).select("id"),
    );
    if (error) throw toError(error);
    if (!data?.length) throw new Error(notChangedMessage);
  },

  setPassword: async (user: IUser, values: ISetPasswordInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("admin_set_password", { p_user_id: user.id, p_password: values.password }),
    );
    if (error) throw toError(error);
  },

  dismissReset: async (user: IUser): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("dismiss_password_reset", { p_user_id: user.id }),
    );
    if (error) throw toError(error);
  },

  remove: async (user: IUser): Promise<void> => {
    const { data, error } = await onlineOnly(
      supabase.from(table).delete().eq("id", user.id).select("id"),
    );
    if (error) throw toError(error);
    if (!data?.length) throw new Error(notChangedMessage);
  },
};

export default userServices;
