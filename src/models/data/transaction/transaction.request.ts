import { z } from "zod";
import type { TransactionStatusTab } from "../../../enums/transaction.enum";

// One cart line: the item as it was when added, plus the quantity. The price is
// what the cart shows and what the transaction saves.
export interface ICartLine {
  item_id: string;
  name: string;
  item_code: string;
  unit: string;
  unit_price: number | null;
  // Caps the stepper; the server re-checks it under a row lock.
  on_hand: number;
  quantity: number;
}

export const voidTransactionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Enter a reason for the void")
    .max(240, "Keep the reason under 240 characters"),
});

export type IVoidTransactionRequest = z.infer<typeof voidTransactionSchema>;

export interface ITransactionFilters {
  tab: TransactionStatusTab;
  // A transaction number, digits only.
  search: string;
  // Instants bounding a shop-local date range: from included, before excluded.
  occurredFrom?: string;
  occurredBefore?: string;
}
