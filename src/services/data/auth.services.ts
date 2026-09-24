import type { Session } from "@supabase/supabase-js";
import type { ISignInRequest } from "../../models/data/auth/auth.request";
import type {
  IAuthSession,
  IProfile,
} from "../../models/data/auth/auth.response";
import { supabase, toError } from "../../utils/supabase.utils";

const profileColumns =
  "id, shop_id, role, full_name, is_active, shop:shops(id, name, is_active)";

const toSession = (session: Session | null): IAuthSession | null =>
  session ? { userId: session.user.id, email: session.user.email ?? null } : null;

// Sign-in and sign-out need the server's answer, so they are online-only and
// never go through the offline queue.
const authServices = {
  signIn: async (values: ISignInRequest): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) throw toError(error);
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw toError(error);
  },

  // Fires once right away with the restored session (or null), then on every
  // sign-in, sign-out and token refresh. Returns the unsubscribe function.
  onSessionChange: (callback: (session: IAuthSession | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      callback(toSession(session)),
    );
    return () => data.subscription.unsubscribe();
  },

  // Null when the account has no profile yet.
  getMe: async (userId: string, signal: AbortSignal): Promise<IProfile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", userId)
      .abortSignal(signal)
      .maybeSingle();
    if (error) throw toError(error);
    return data as IProfile | null;
  },
};

export default authServices;
