import { z } from "zod";
import {
  movementModeReasons,
  movementModeTypes,
  type MovementTab,
} from "../../../enums/movement.enum";

export const stockMovementSchema = z
  .object({
    mode: z.enum(["sale", "stock_in", "stock_out"]),
    reason: z.enum(["restock", "correction", "sale", "damaged"], { message: "Pick a reason" }),
    // Text input; the service sends it as a number. Nine digits stays inside a Postgres integer.
    quantity: z
      .string()
      .trim()
      .regex(/^[1-9]\d{0,8}$/, "Enter a whole number greater than zero"),
    note: z.string().trim().max(240, "Keep the note under 240 characters"),
    // The item's stock when the form opened; the server re-checks it under a row lock.
    on_hand: z.number(),
    // Fixed when the form opens, so a retried submit is recorded once.
    client_id: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!movementModeReasons[values.mode].includes(values.reason)) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: "Pick a reason" });
    }
    if (movementModeTypes[values.mode] === "stock_out" && Number(values.quantity) > values.on_hand) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: `Only ${values.on_hand} on hand`,
      });
    }
  });

export type IStockMovementRequest = z.infer<typeof stockMovementSchema>;

export interface IMovementFilters {
  tab: MovementTab;
  reason?: string;
  search: string;
}
