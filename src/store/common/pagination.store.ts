import type { IPaginationRequest } from "../../models/common/pagination.model";
import { create } from "./reset.store";

// Only what was written is kept per key; usePagination layers a table's defaults under it,
// so a reset (filter, search, branch switch) falls back to that table's own page size.
type States = {
  pagination: Record<string, Partial<IPaginationRequest>>;
};

type Actions = {
  setPagination: (key: string, patch: Partial<IPaginationRequest>) => void;
  resetPagination: (key: string) => void;
};

const initialValues: States = {
  pagination: {},
};

const unset: Partial<IPaginationRequest> = {};

export const usePaginationStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setPagination: (key, patch) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: { ...state.pagination[key], ...patch },
      },
    })),
  resetPagination: (key) =>
    set((state) => ({
      pagination: { ...state.pagination, [key]: unset },
    })),
}));

export const selectPagination = (key: string) => (state: States) =>
  state.pagination[key] ?? unset;
