import type {
  IChangePasswordInput,
  IForgotPasswordInput,
  ILoginInput,
  IRegisterInput,
} from "../../models/data/account/account.request";
import type {
  ICustomLoginResponse,
  ILoginResult,
} from "../../models/data/account/account.response";
import {
  assertOnline,
  onlineOnly,
  onSessionExpired,
  setCustomToken,
  supabase,
  toError,
} from "../../utils/supabase.utils";

const accountNotApprovedCode = "28000";
const invalidCredentialsCode = "28P01";
const developerRole = "developer";
const invalidCredentialsMessage = "Invalid email or password.";
const wrongCurrentPasswordMessage = "Current password is incorrect.";

const approvalMessages: Record<string, string> = {
  "account is pending": "Your account is waiting for the owner's approval.",
  "account is rejected": "Your account is disabled. Ask the owner to turn it back on.",
};

const toLoginError = (error: { code?: string; message: string }): Error =>
  error.code === accountNotApprovedCode
    ? new Error(approvalMessages[error.message] ?? error.message)
    : toError(error);

// The developer is not in public.users, so a failed table login falls back to
// Supabase Auth and is accepted only when that account is in app.authorities.
const loginDeveloper = async (values: ILoginInput): Promise<ILoginResult> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(invalidCredentialsMessage);

  const { data, error: roleError } = await supabase.rpc("my_authority_role");
  if (!roleError && data === developerRole) {
    return { kind: "developer", email: values.email };
  }

  await supabase.auth.signOut().catch(() => undefined);
  throw new Error(invalidCredentialsMessage);
};

const accountServices = {
  login: async (values: ILoginInput): Promise<ILoginResult> => {
    setCustomToken(null);

    const { data, error } = await onlineOnly(
      supabase.rpc("login_email", {
        p_email: values.email,
        p_password: values.password,
      }),
    );
    if (error?.code === invalidCredentialsCode) return loginDeveloper(values);
    if (error) throw toLoginError(error);

    const session = data as ICustomLoginResponse;
    setCustomToken(session.token);
    return { kind: "custom", session };
  },

  restoreCustomToken: (token: string | null): void => setCustomToken(token),

  onSessionExpired: (handler: (() => void) | null): void => onSessionExpired(handler),

  register: async (values: IRegisterInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("register_email", {
        p_email: values.email,
        p_full_name: values.full_name,
        p_password: values.password,
      }),
    );
    if (error) throw toError(error);
  },

  requestPasswordReset: async (values: IForgotPasswordInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("request_password_reset", {
        p_email: values.email,
        p_password: values.password,
      }),
    );
    if (error) throw toError(error);
  },

  changeOwnPassword: async (values: IChangePasswordInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("change_own_password", {
        p_current_password: values.current_password,
        p_new_password: values.password,
      }),
    );
    if (error) throw toError(error);
  },

  changeDeveloperPassword: async (
    email: string,
    values: IChangePasswordInput,
  ): Promise<void> => {
    assertOnline();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: values.current_password,
    });
    if (verifyError) throw new Error(wrongCurrentPasswordMessage);

    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) throw toError(error);
  },

  logout: async (): Promise<void> => {
    setCustomToken(null);
    await supabase.auth.signOut().catch(() => undefined);
  },
};

export default accountServices;
