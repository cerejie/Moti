import { create } from "zustand";
import type { IAuthSession } from "../../../models/data/auth/auth.response";

export type AuthStatus = "loading" | "signedIn" | "signedOut";

type States = {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
};

type Actions = {
  setSession: (session: IAuthSession | null) => void;
};

const initialValues: States = {
  status: "loading",
  userId: null,
  email: null,
};

// Plain zustand create, not the reset-aware one: a sign-out reset would put the
// status back to "loading" and hold the guards on a spinner. Supabase persists
// the session itself, so nothing is persisted here.
export const useAuthStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSession: (session) =>
    set(
      session
        ? { status: "signedIn", userId: session.userId, email: session.email }
        : { status: "signedOut", userId: null, email: null },
    ),
}));

export const selectAuthStatus = (state: States) => state.status;

export const selectUserId = (state: States) => state.userId;

export const selectEmail = (state: States) => state.email;
