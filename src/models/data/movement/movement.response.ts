import type { MovementReason, MovementType } from "../../../enums/stock.enum";

export interface IStockMovement {
  id: string;
  item_id: string;
  item: { name: string; sku: string; unit: string } | null;
  type: MovementType;
  reason: MovementReason;
  // Signed: positive for stock in, negative for stock out.
  quantity: number;
  balance_after: number;
  note: string | null;
  created_by_name: string;
  created_at: string;
}
