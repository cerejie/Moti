// The only reader of import.meta.env; every value is named here exactly once.

const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase project's values.`,
    );
  }
  return value;
};

export const env = {
  supabaseUrl: required("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
  // The anon key is public by design; RLS is the security boundary.
  supabaseAnonKey: required(
    "VITE_SUPABASE_ANON_KEY",
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  ),
  // Optional: push notifications stay off until the VAPID public key is set.
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "",
};
