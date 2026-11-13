import { z } from "zod";
import type { IInventoryItem } from "../inventory/inventory.response";

export const deliveryFormSchema = z.object({
  note: z.string().trim().max(200),
});
export type IDeliveryFormInput = z.infer<typeof deliveryFormSchema>;

// The part of an item a delivery line keeps: enough to show the line and its stock.
export type IStockLineItem = Pick<
  IInventoryItem,
  "id" | "name" | "item_code" | "unit" | "on_hand" | "category_id"
>;

export interface IDeliveryLine {
  item: IStockLineItem;
  quantity: number;
}
