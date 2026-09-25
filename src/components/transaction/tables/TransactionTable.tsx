import DataTable from "../../common/table/DataTable";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import {
  transactionStatusLabels,
  transactionStatusTones,
} from "../../../enums/transaction.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { transactionTableKey } from "../../../keys/table.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import {
  formatDateTime,
  formatItemCount,
  formatPeso,
  formatTransactionNo,
} from "../../../utils/format.utils";
import { tableCellNumeric } from "../../../styles/table/table.styles";
import {
  historyAmount,
  historyAmountStack,
  historyCell,
  historyMeta,
  historyTitle,
} from "../../../styles/transaction/transaction.styles";

type IProps = {
  transactions: ITransaction[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  showCreatedBy: boolean;
  onOpen: (transaction: ITransaction) => void;
  emptyText: string;
};

const column = dataTableColumns<ITransaction>();

const statusBadge = (transaction: ITransaction) => (
  <StatusBadge tone={transactionStatusTones[transaction.status]}>
    {transactionStatusLabels[transaction.status]}
  </StatusBadge>
);

const TransactionTable = ({
  transactions,
  isLoading,
  isError,
  error,
  onRetry,
  showCreatedBy,
  onOpen,
  emptyText,
}: IProps) => {
  const isMobile = useIsMobile();

  // A phone gets two columns: the number and when, then the amount and status.
  const mobileColumns = [
    column.display({
      id: "transaction",
      header: "Transaction",
      cell: ({ row }) => {
        const transaction = row.original;
        const meta = [
          formatDateTime(transaction.occurred_at),
          formatItemCount(transaction.line_count),
          showCreatedBy ? transaction.created_by_name : null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div className={historyCell}>
            <span className={historyTitle}>
              {formatTransactionNo(transaction.transaction_no)}
            </span>
            <span className={historyMeta}>{meta}</span>
          </div>
        );
      },
    }),
    column.display({
      id: "total_amount",
      header: () => <span className={tableCellNumeric}>Total</span>,
      cell: ({ row }) => (
        <div className={historyAmountStack}>
          <span className={historyAmount}>{formatPeso(row.original.total_amount)}</span>
          {statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    column.display({
      id: "transaction_no",
      header: "No.",
      cell: ({ row }) => (
        <span className={historyTitle}>{formatTransactionNo(row.original.transaction_no)}</span>
      ),
    }),
    column.display({
      id: "occurred_at",
      header: "When",
      cell: ({ row }) => formatDateTime(row.original.occurred_at),
    }),
    column.display({
      id: "line_count",
      header: "Items",
      cell: ({ row }) => formatItemCount(row.original.line_count),
    }),
    column.display({
      id: "total_amount",
      header: () => <span className={tableCellNumeric}>Total</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>{formatPeso(row.original.total_amount)}</div>
      ),
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
    ...(showCreatedBy
      ? [
          column.display({
            id: "created_by",
            header: "By",
            cell: ({ row }) => row.original.created_by_name ?? "—",
          }),
        ]
      : []),
  ];

  return (
    <DataTable
      tableKey={transactionTableKey}
      label="Transactions"
      data={transactions}
      columns={isMobile ? mobileColumns : desktopColumns}
      getRowId={(transaction) => transaction.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={emptyText}
      loadingText="Loading transactions…"
      onRowClick={onOpen}
    />
  );
};

export default TransactionTable;
