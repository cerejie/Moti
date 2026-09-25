import type { TransactionStatus } from "../../../enums/transaction.enum";
import type { IMutationResult } from "../../common/write.model";

// One row of the transaction_history view.
export interface ITransaction {
  id: string;
  shop_id: string;
  transaction_no: number;
  status: TransactionStatus;
  total_amount: number;
  line_count: number;
  occurred_at: string;
  created_by: string | null;
  // Null when the profile is gone or hidden from the caller.
  created_by_name: string | null;
  voided_by: string | null;
  voided_by_name: string | null;
  voided_at: string | null;
  void_reason: string | null;
}

// One row of the transaction_line_details view.
export interface ITransactionLine {
  id: string;
  transaction_id: string;
  item_id: string;
  item_name: string;
  item_code: string;
  item_unit: string | null;
  quantity: number;
  unit_price: number | null;
  line_amount: number;
}

// A queued transaction has no number until it syncs.
export interface ICreateTransactionResult extends IMutationResult {
  transactionNo: number | null;
}
