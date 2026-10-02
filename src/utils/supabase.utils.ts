import { createClient } from "@supabase/supabase-js";
import { env } from "./env.utils";
import { isFetchFailure, NetworkError } from "./error.utils";

// Owners and employees sign in through the login_email RPC, which returns a JWT
// signed by the database. It rides on every request in place of the anon key.
let customToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

const unauthorizedStatus = 401;
const networkStatus = 0;
const authEndpoint = "/auth/v1/";

const requestUrlOf = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

const withAuthorization = (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  if (!customToken) return fetch(input, init);

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${customToken}`);
  return fetch(input, { ...init, headers });
};

const customFetch: typeof fetch = async (input, init) => {
  const response = await withAuthorization(input, init);
  const isExpired =
    response.status === unauthorizedStatus &&
    !requestUrlOf(input).includes(authEndpoint);
  if (isExpired) sessionExpiredHandler?.();
  return response;
};

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: { fetch: customFetch },
});

export const setCustomToken = (token: string | null): void => {
  customToken = token;
  // Realtime opens its own socket, so it needs the token separately from customFetch.
  void supabase.realtime.setAuth(token);
};

export const onSessionExpired = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler;
};

const constraintMessages: Record<string, string> = {
  "23503": "This record is still used by other records, so it cannot be deleted.",
  "23505": "A record with these details already exists.",
  "23514": "One of the values is not allowed.",
  "42501": "You don't have permission to do that.",
};

// Messages raised on purpose by our own RPCs are already user-readable.
const raisedCode = "P0001";

export const toError = (error: unknown): Error => {
  if (isFetchFailure(error)) return new NetworkError();
  if (error instanceof Error) return error;

  if (error && typeof error === "object" && "message" in error) {
    const code = "code" in error ? String((error as { code: unknown }).code) : "";
    const message = String((error as { message: unknown }).message);
    if (code === raisedCode) return new Error(message);
    return new Error(constraintMessages[code] ?? message);
  }

  return new Error("Unexpected error");
};

const needsInternetMessage =
  "This needs an internet connection. Try again once you are back online.";

export const assertOnline = (): void => {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  if (offline) throw new Error(needsInternetMessage);
};

// For writes that need the server's answer now (sign-in, accounts), never queued.
export const onlineOnly = async <TResult extends { status: number }>(
  request: PromiseLike<TResult>,
): Promise<TResult> => {
  assertOnline();

  const result = await request;
  if (result.status === networkStatus) throw new Error(needsInternetMessage);

  return result;
};
