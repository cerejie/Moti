import { create } from "zustand";
import { persist } from "zustand/middleware";
import { branchStorageKey } from "../../../keys/storage.keys";

type States = {
  // null is "All branches".
  branchFilter: string | null;
};

type Actions = {
  setBranchFilter: (branchFilter: string | null) => void;
};

const initialValues: States = {
  branchFilter: null,
};

// Plain zustand create with persist: the choice is remembered on the device, and
// useBranchScope ignores an id the signed-in account cannot see.
export const useBranchStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setBranchFilter: (branchFilter) => set({ branchFilter }),
    }),
    { name: branchStorageKey },
  ),
);

export const selectBranchFilter = (state: States): string | null => state.branchFilter;
