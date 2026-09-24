import type { IFilterValues } from "../../models/common/filter.model";
import { create } from "./reset.store";

type States = {
  filters: Record<string, IFilterValues>;
};

type Actions = {
  setFilters: (key: string, patch: IFilterValues) => void;
  resetFilters: (key: string) => void;
};

const initialValues: States = {
  filters: {},
};

const emptyFilters: IFilterValues = {};

export const useFilterStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setFilters: (key, patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: { ...(state.filters[key] ?? emptyFilters), ...patch },
      },
    })),
  resetFilters: (key) =>
    set((state) => ({ filters: { ...state.filters, [key]: emptyFilters } })),
}));

export const selectFilters = (key: string) => (state: States) =>
  state.filters[key] ?? emptyFilters;
