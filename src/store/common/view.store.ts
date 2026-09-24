import { create } from "./reset.store";

type States = {
  searches: Record<string, string>;
  // Keyed show/hide flags - timeline "see more", password reveal, and any
  // other one-boolean disclosure. Keeps components free of useState.
  disclosures: Record<string, boolean>;
};

type Actions = {
  setSearch: (key: string, value: string) => void;
  resetSearch: (key: string) => void;
  setDisclosure: (key: string, value: boolean) => void;
  toggleDisclosure: (key: string) => void;
};

const initialValues: States = {
  searches: {},
  disclosures: {},
};

export const useViewStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSearch: (key, value) =>
    set((state) => ({ searches: { ...state.searches, [key]: value } })),
  resetSearch: (key) =>
    set((state) => ({ searches: { ...state.searches, [key]: "" } })),
  setDisclosure: (key, value) =>
    set((state) => ({ disclosures: { ...state.disclosures, [key]: value } })),
  toggleDisclosure: (key) =>
    set((state) => ({
      disclosures: { ...state.disclosures, [key]: !state.disclosures[key] },
    })),
}));

export const selectSearch = (key: string) => (state: States) =>
  state.searches[key] ?? "";

export const selectDisclosure = (key: string) => (state: States) =>
  state.disclosures[key] ?? false;
