import type { CountStep, ICountLine } from "../../../models/data/count/count.request";
import type { IStockLineItem } from "../../../models/data/delivery/delivery.request";
import { create } from "../../common/reset.store";

type States = {
  // The branch being counted; set by the first item added. Each line's on_hand is this branch's.
  branchId: string | null;
  lines: ICountLine[];
  step: CountStep;
};

type Actions = {
  add: (branchId: string, item: IStockLineItem) => void;
  addMany: (branchId: string, items: readonly IStockLineItem[]) => void;
  setCounted: (itemId: string, counted: number | null) => void;
  remove: (itemId: string) => void;
  setStep: (step: CountStep) => void;
  clear: () => void;
};

const initialValues: States = {
  branchId: null,
  lines: [],
  step: "count",
};

// The most items one count saves; the database refuses more.
export const maxCountLines = 200;

// Re-adding an item keeps what was typed but refreshes the on-hand it is compared with.
const merge = (lines: ICountLine[], items: readonly IStockLineItem[]): ICountLine[] => {
  const next = lines.map((line) => {
    const fresh = items.find((item) => item.id === line.item.id);
    return fresh ? { ...line, item: fresh } : line;
  });
  const added = items
    .filter((item) => !lines.some((line) => line.item.id === item.id))
    .map((item) => ({ item, counted: null }));

  return [...next, ...added].slice(0, maxCountLines);
};

// The switcher clears the count first; this only catches a branch archived mid-count.
const linesFor = (state: States, branchId: string) =>
  state.branchId !== null && state.branchId !== branchId ? [] : state.lines;

// Kept in memory only: a count lives for one save, and sign-out clears it.
export const useCountStore = create<States & Actions>()((set) => ({
  ...initialValues,

  add: (branchId, item) =>
    set((state) => ({ branchId, lines: merge(linesFor(state, branchId), [item]) })),

  addMany: (branchId, items) =>
    set((state) => ({ branchId, lines: merge(linesFor(state, branchId), items) })),

  setCounted: (itemId, counted) =>
    set((state) => ({
      lines: state.lines.map((line) => (line.item.id === itemId ? { ...line, counted } : line)),
    })),

  remove: (itemId) =>
    set((state) => {
      const lines = state.lines.filter((line) => line.item.id !== itemId);
      return { lines, branchId: lines.length === 0 ? null : state.branchId };
    }),

  setStep: (step) => set({ step }),

  clear: () => set(initialValues),
}));

export const selectCountLines = (state: States) => state.lines;

export const selectCountBranch = (state: States) => state.branchId;

export const selectCountStep = (state: States) => state.step;

export const selectIsCounting = (itemId: string) => (state: States) =>
  state.lines.some((line) => line.item.id === itemId);
