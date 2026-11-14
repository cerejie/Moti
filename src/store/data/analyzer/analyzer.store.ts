import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCoverDays, type CoverDays } from "../../../enums/analyzer.enum";
import { analysisStorageKey } from "../../../keys/storage.keys";

type States = {
  coverDays: CoverDays;
};

type Actions = {
  setCoverDays: (coverDays: CoverDays) => void;
};

const initialValues: States = {
  coverDays: defaultCoverDays,
};

// Plain zustand create with persist: a device preference, like the branch choice.
export const useAnalyzerStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setCoverDays: (coverDays) => set({ coverDays }),
    }),
    { name: analysisStorageKey },
  ),
);

export const selectCoverDays = (state: States): CoverDays => state.coverDays;
