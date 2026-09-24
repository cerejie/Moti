import type { MovementReason, MovementType } from "../../../enums/movement.enum";

// One row of the stock_movement_history view.
export interface IStockMovement {
  id: string;
  shop_id: string;
  item_id: string;
  item_name: string;
  item_sku: string;
  item_unit: string;
  movement_type: MovementType;
  reason: MovementReason;
  // Signed: positive for stock in, negative for stock out.
  quantity: number;
  balance_after: number;
  note: string | null;
  occurred_at: string;
  created_by: string | null;
  created_by_name: string | null;
}
