import { createClient } from "@supabase/supabase-js";
import { env } from "./env.utils";

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const constraintMessages: Record<string, string> = {
  "23503": "This record is still used by other records, so it cannot be deleted.",
  "23505": "A record with these details already exists.",
  "23514": "One of the values is not allowed.",
  "42501": "You don't have permission to do that.",
};

export const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;

  if (error && typeof error === "object" && "message" in error) {
    const code = "code" in error ? String((error as { code: unknown }).code) : "";
    return new Error(
      constraintMessages[code] ?? String((error as { message: unknown }).message),
    );
  }

  return new Error("Unexpected error");
};
