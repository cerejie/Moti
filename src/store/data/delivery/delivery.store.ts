import type {
  IDeliveryLine,
  IStockLineItem,
} from "../../../models/data/delivery/delivery.request";
import { create } from "../../common/reset.store";

type States = {
  // The branch receiving it; set by the first item added. An order list fill leaves it unset
  // until the save, which then uses the selected branch.
  branchId: string | null;
  lines: IDeliveryLine[];
  // Set when the delivery was started from the order list; the save then updates that list.
  orderListId: string | null;
};

type Actions = {
  add: (branchId: string, item: IStockLineItem) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  fillFromOrderList: (orderListId: string, lines: IDeliveryLine[]) => void;
  clear: () => void;
};

const initialValues: States = {
  branchId: null,
  lines: [],
  orderListId: null,
};

const maxQuantity = 99_999;

// A delivery has no shelf limit, only a floor of 1 and a sanity ceiling.
export const clampDeliveryQuantity = (quantity: number) =>
  Math.max(1, Math.min(Math.floor(quantity), maxQuantity));

// Kept in memory only, like the cart: a delivery lives for one save.
export const useDeliveryStore = create<States & Actions>()((set) => ({
  ...initialValues,

  add: (branchId, item) =>
    set((state) => {
      // The switcher clears the delivery first; this only catches a branch archived mid-way.
      if (state.branchId !== null && state.branchId !== branchId) {
        return { branchId, orderListId: null, lines: [{ item, quantity: 1 }] };
      }
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (!existing) return { branchId, lines: [...state.lines, { item, quantity: 1 }] };

      return {
        branchId,
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
    set((state) => {
      const lines = state.lines.filter((line) => line.item.id !== itemId);
      return { lines, branchId: lines.length === 0 ? null : state.branchId };
    }),

  // Replaces the draft: the list is what is expected, each quantity is then confirmed or changed.
  fillFromOrderList: (orderListId, lines) =>
    set({
      branchId: null,
      orderListId,
      lines: lines.map((line) => ({ ...line, quantity: clampDeliveryQuantity(line.quantity) })),
    }),

  clear: () => set(initialValues),
}));

export const selectDeliveryLines = (state: States) => state.lines;

export const selectDeliveryBranch = (state: States) => state.branchId;

export const selectDeliveryOrderListId = (state: States) => state.orderListId;

export const selectDeliveryQuantity = (itemId: string) => (state: States) =>
  state.lines.find((line) => line.item.id === itemId)?.quantity ?? 0;
