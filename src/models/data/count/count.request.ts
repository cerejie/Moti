import { z } from "zod";
import type { IStockLineItem } from "../delivery/delivery.request";

export const countFormSchema = z.object({
  note: z.string().trim().max(200),
});
export type ICountFormInput = z.infer<typeof countFormSchema>;

// item.on_hand is what the screen showed when the item was picked; the database
// records counted − that, never the absolute count.
export interface ICountLine {
  item: IStockLineItem;
  counted: number | null;
}

export type CountStep = "count" | "review";
