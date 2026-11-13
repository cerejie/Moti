import type {
  IDeliveryLine,
  IStockLineItem,
} from "../../../models/data/delivery/delivery.request";
import { create } from "../../common/reset.store";

type States = {
  lines: IDeliveryLine[];
};

type Actions = {
  add: (item: IStockLineItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

const initialValues: States = {
  lines: [],
};

const maxQuantity = 99_999;

// A delivery has no shelf limit, only a floor of 1 and a sanity ceiling.
export const clampDeliveryQuantity = (quantity: number) =>
  Math.max(1, Math.min(Math.floor(quantity), maxQuantity));

// Kept in memory only, like the cart: a delivery lives for one save.
export const useDeliveryStore = create<States & Actions>()((set) => ({
  ...initialValues,

  add: (item) =>
    set((state) => {
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (!existing) return { lines: [...state.lines, { item, quantity: 1 }] };

      return {
        lines: state.lines.map((line) =>
          line.item.id === item.id
            ? { item, quantity: clampDeliveryQuantity(line.quantity + 1) }
            : line,
        ),
      };
    }),

  setQuantity: (itemId, quantity) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.item.id === itemId ? { ...line, quantity: clampDeliveryQuantity(quantity) } : line,
      ),
    })),

  remove: (itemId) =>
    set((state) => ({ lines: state.lines.filter((line) => line.item.id !== itemId) })),

  clear: () => set({ lines: [] }),
}));

export const selectDeliveryLines = (state: States) => state.lines;

export const selectDeliveryQuantity = (itemId: string) => (state: States) =>
  state.lines.find((line) => line.item.id === itemId)?.quantity ?? 0;
