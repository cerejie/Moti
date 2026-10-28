import type { MovementReason, MovementType } from "../../../enums/stock.enum";

export interface IStockMovement {
  id: string;
  item_id: string;
  // Set on sale and voided-sale movements, which a transaction wrote.
  transaction_id: string | null;
  item: { name: string; item_code: string; unit: string } | null;
  type: MovementType;
  reason: MovementReason;
  // Signed: positive for stock in, negative for stock out.
  quantity: number;
  balance_after: number;
  note: string | null;
  created_by_name: string;
  created_at: string;
}
