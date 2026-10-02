import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthorityRole, EffectiveRole } from "../../../enums/role.enum";
import { accountStorageKey } from "../../../keys/storage.keys";
import type {
  IAuthUser,
  ICustomLoginResponse,
} from "../../../models/data/account/account.response";
import { setCustomToken } from "../../../utils/supabase.utils";

export type SessionKind = AuthorityRole | "custom";

type States = {
  kind: SessionKind | null;
  user: IAuthUser | null;
  token: string | null;
  // Unix seconds; the custom token stops working after this.
  expiresAt: number | null;
  developerEmail: string | null;
};

type Actions = {
  setCustomSession: (session: ICustomLoginResponse) => void;
  setDeveloperSession: (email: string) => void;
  clear: () => void;
};

const initialValues: States = {
  kind: null,
  user: null,
  token: null,
  expiresAt: null,
  developerEmail: null,
};

// Plain zustand create with persist: the session must survive a reload, and
// sign-out clears it explicitly before resetAllStores runs.
export const useAccountStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,

      setCustomSession: (session) =>
        set({
          kind: "custom",
          token: session.token,
          expiresAt: session.expires_at,
          user: session.user,
          developerEmail: null,
        }),

      setDeveloperSession: (email) =>
        set({ ...initialValues, kind: "developer", developerEmail: email }),

      clear: () => set({ ...initialValues }),
    }),
    {
      name: accountStorageKey,
      onRehydrateStorage: () => (state) => {
        if (state?.kind === "custom" && state.token) setCustomToken(state.token);
      },
    },
  ),
);

export const selectRole = (state: States): EffectiveRole | null => {
  if (state.kind === "developer") return "developer";
  return state.user?.role ?? null;
};

export const selectIsAuthenticated = (state: States): boolean => state.kind !== null;

export const selectUserId = (state: States): string | null => state.user?.id ?? null;

export const selectDisplayName = (state: States): string =>
  state.user?.full_name ?? (state.kind === "developer" ? "Developer" : "");

export const selectEmail = (state: States): string =>
  state.user?.email ?? state.developerEmail ?? "";

// Who owns this device's offline queue: the table user, or the developer.
export const selectSessionOwner = (state: States): string | null => {
  if (state.kind === "developer") return `developer:${state.developerEmail ?? ""}`;
  return state.user?.id ?? null;
};
