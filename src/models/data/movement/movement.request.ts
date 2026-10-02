import { z } from "zod";
import {
  movementReasonSchema,
  movementTypeSchema,
  type MovementType,
} from "../../../enums/stock.enum";

export const movementFormSchema = z.object({
  type: movementTypeSchema,
  reason: movementReasonSchema,
  quantity: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, "Enter a quantity of at least 1"),
  note: z.string().trim().max(200),
});
export type IMovementFormInput = z.infer<typeof movementFormSchema>;

export interface IMovementFilters {
  type?: MovementType;
}
