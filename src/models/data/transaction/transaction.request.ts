import { z } from "zod";
import type { TransactionStatus } from "../../../enums/transaction.enum";
import type { IInventoryItem } from "../inventory/inventory.response";

export const checkoutFormSchema = z.object({
  note: z.string().trim().max(200),
});
export type ICheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const voidFormSchema = z.object({
  reason: z.string().trim().min(3, "Say why, e.g. customer returned the items").max(200),
});
export type IVoidFormInput = z.infer<typeof voidFormSchema>;

// The part of an item the cart keeps: enough to show the line and cap its quantity.
export type ICartItem = Pick<
  IInventoryItem,
  "id" | "name" | "sku" | "unit" | "on_hand" | "selling_price"
>;

export interface ICartLine {
  item: ICartItem;
  quantity: number;
}

export interface ITransactionFilters {
  status?: TransactionStatus;
}
