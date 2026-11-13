import { z } from "zod";
import type { MovementReason } from "../../../enums/stock.enum";

export const damagedFormSchema = z.object({
  quantity: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, "Enter a quantity of at least 1"),
  note: z.string().trim().max(200),
});
export type IDamagedFormInput = z.infer<typeof damagedFormSchema>;

export interface IMovementFilters {
  reasons: readonly MovementReason[];
  personId?: string;
  search: string;
}
