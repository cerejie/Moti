import { create } from "zustand";
import { persist } from "zustand/middleware";
import { activeShopStorageKey } from "../../../keys/storage.keys";

type States = {
  // The shop the superadmin is working in; owners and employees use their own.
  activeShopId: string | null;
};

type Actions = {
  setActiveShopId: (activeShopId: string | null) => void;
  clear: () => void;
};

const initialValues: States = {
  activeShopId: null,
};

// Plain zustand create: the reset-aware one would restore the persisted value
// rather than clear it. The session hook clears it on sign-out instead.
export const useShopStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setActiveShopId: (activeShopId) => set({ activeShopId }),
      clear: () => set(initialValues),
    }),
    { name: activeShopStorageKey },
  ),
);

export const selectActiveShopId = (state: States) => state.activeShopId;
