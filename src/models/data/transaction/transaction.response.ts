import type { TransactionStatus } from "../../../enums/transaction.enum";

export interface ITransaction {
  id: string;
  number: number;
  status: TransactionStatus;
  line_count: number;
  total_quantity: number;
  // Display only; null when no line had a selling price.
  total_amount: number | null;
  note: string | null;
  created_by_name: string;
  created_at: string;
  voided_at: string | null;
  voided_by_name: string | null;
  void_reason: string | null;
}

// One sold item: a 'sale' row of the stock ledger that carries the transaction id.
export interface ITransactionLine {
  id: string;
  item_id: string;
  item: { name: string; item_code: string; unit: string } | null;
  // Negative, as stored in the ledger.
  quantity: number;
  unit_price: number | null;
}
