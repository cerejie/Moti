import type { CountStep, ICountLine } from "../../../models/data/count/count.request";
import type { IStockLineItem } from "../../../models/data/delivery/delivery.request";
import { create } from "../../common/reset.store";

type States = {
  lines: ICountLine[];
  step: CountStep;
};

type Actions = {
  add: (item: IStockLineItem) => void;
  addMany: (items: readonly IStockLineItem[]) => void;
  setCounted: (itemId: string, counted: number | null) => void;
  remove: (itemId: string) => void;
  setStep: (step: CountStep) => void;
  clear: () => void;
};

const initialValues: States = {
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

// Kept in memory only: a count lives for one save, and sign-out clears it.
export const useCountStore = create<States & Actions>()((set) => ({
  ...initialValues,

  add: (item) => set((state) => ({ lines: merge(state.lines, [item]) })),

  addMany: (items) => set((state) => ({ lines: merge(state.lines, items) })),

  setCounted: (itemId, counted) =>
    set((state) => ({
      lines: state.lines.map((line) => (line.item.id === itemId ? { ...line, counted } : line)),
    })),

  remove: (itemId) =>
    set((state) => ({ lines: state.lines.filter((line) => line.item.id !== itemId) })),

  setStep: (step) => set({ step }),

  clear: () => set(initialValues),
}));

export const selectCountLines = (state: States) => state.lines;

export const selectCountStep = (state: States) => state.step;

export const selectIsCounting = (itemId: string) => (state: States) =>
  state.lines.some((line) => line.item.id === itemId);
