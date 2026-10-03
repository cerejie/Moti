import type {
  ICartItem,
  ICartLine,
} from "../../../models/data/transaction/transaction.request";
import { create } from "../../common/reset.store";

type States = {
  lines: ICartLine[];
};

type Actions = {
  add: (item: ICartItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

const initialValues: States = {
  lines: [],
};

// A quantity never drops below 1 or rises past what is on the shelf; the
// database checks again at checkout.
export const clampQuantity = (quantity: number, onHand: number) =>
  Math.max(1, Math.min(Math.floor(quantity), onHand));

// Kept in memory only: a cart lives for one sale, and sign-out clears it.
export const useCartStore = create<States & Actions>()((set) => ({
  ...initialValues,

  // Adding again bumps the quantity and refreshes the stock the row showed.
  add: (item) =>
    set((state) => {
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (!existing) return { lines: [...state.lines, { item, quantity: 1 }] };

      return {
        lines: state.lines.map((line) =>
          line.item.id === item.id
            ? { item, quantity: clampQuantity(line.quantity + 1, item.on_hand) }
            : line,
        ),
      };
    }),

  setQuantity: (itemId, quantity) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.item.id === itemId
          ? { ...line, quantity: clampQuantity(quantity, line.item.on_hand) }
          : line,
      ),
    })),

  remove: (itemId) =>
    set((state) => ({ lines: state.lines.filter((line) => line.item.id !== itemId) })),

  clear: () => set({ lines: [] }),
}));

export const selectCartLines = (state: States) => state.lines;

export const selectCartQuantity = (itemId: string) => (state: States) =>
  state.lines.find((line) => line.item.id === itemId)?.quantity ?? 0;
