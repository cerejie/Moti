import type {
  ICartItem,
  ICartLine,
} from "../../../models/data/transaction/transaction.request";
import { newWriteId } from "../../../utils/write.utils";
import { create } from "../../common/reset.store";

type States = {
  // The branch the cart sells from; set by the first item added.
  branchId: string | null;
  // The sale's idempotency key: fixed from the first product until the sale is saved or cleared,
  // so a double tap or a retry after a lost response never records it twice.
  clientId: string | null;
  lines: ICartLine[];
};

type Actions = {
  add: (branchId: string, item: ICartItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

const initialValues: States = {
  branchId: null,
  clientId: null,
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
  add: (branchId, item) =>
    set((state) => {
      // The switcher clears the cart first; this only catches a branch archived mid-sale.
      if (state.branchId !== null && state.branchId !== branchId) {
        return { branchId, clientId: newWriteId(), lines: [{ item, quantity: 1 }] };
      }
      const clientId = state.clientId ?? newWriteId();
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (!existing) return { branchId, clientId, lines: [...state.lines, { item, quantity: 1 }] };

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
    set((state) => {
      const lines = state.lines.filter((line) => line.item.id !== itemId);
      return lines.length === 0 ? { ...initialValues } : { lines };
    }),

  clear: () => set({ ...initialValues }),
}));

export const selectCartLines = (state: States) => state.lines;

export const selectCartBranch = (state: States) => state.branchId;

export const selectCartClientId = (state: States) => state.clientId;

export const selectCartQuantity = (itemId: string) => (state: States) =>
  state.lines.find((line) => line.item.id === itemId)?.quantity ?? 0;
