import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartStorageKey } from "../../../keys/storage.keys";
import type { ICartLine } from "../../../models/data/transaction/transaction.request";
import { newWriteId } from "../../../utils/write.utils";

type States = {
  // The shop the cart was filled in; a cart never carries over to another shop.
  shopId: string | null;
  // The transaction's idempotency key: fixed while the cart is filled, so a
  // retried confirm is saved once. A cleared cart gets a new one.
  clientId: string;
  lines: ICartLine[];
};

type Actions = {
  addLine: (shopId: string, line: Omit<ICartLine, "quantity">) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  removeLine: (itemId: string) => void;
  clear: () => void;
};

const emptyCart = (): States => ({ shopId: null, clientId: newWriteId(), lines: [] });

const capped = (quantity: number, onHand: number) => Math.max(1, Math.min(quantity, onHand));

// Plain zustand create and persisted, so a reload keeps the cart. The session
// hook clears it on sign-out, like the shop store.
export const useCartStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...emptyCart(),

      // Adding an item already in the cart adds one more, with its stock refreshed.
      addLine: (shopId, line) =>
        set((state) => {
          const base = state.shopId === shopId ? state : { ...emptyCart(), shopId };
          const existing = base.lines.find((entry) => entry.item_id === line.item_id);
          const lines = existing
            ? base.lines.map((entry) =>
                entry.item_id === line.item_id
                  ? { ...entry, ...line, quantity: capped(entry.quantity + 1, line.on_hand) }
                  : entry,
              )
            : [...base.lines, { ...line, quantity: 1 }];
          return { ...base, lines };
        }),

      setQuantity: (itemId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.item_id === itemId ? { ...line, quantity: capped(quantity, line.on_hand) } : line,
          ),
        })),

      removeLine: (itemId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.item_id !== itemId) })),

      clear: () => set(emptyCart()),
    }),
    { name: cartStorageKey },
  ),
);
