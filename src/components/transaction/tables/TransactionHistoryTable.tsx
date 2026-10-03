import {
  transactionStatusLabels,
  type TransactionStatus,
} from "../../../enums/transaction.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useTransactionHistory } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionDetailModalKey } from "../../../keys/modal.keys";
import { transactionHistoryTableKey } from "../../../keys/table.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import {
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { historyStatusTabs } from "../../../styles/transaction/transaction.styles";
import { formatCount, formatDateTime, formatPeso } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import SegmentedControl from "../../common/filter/SegmentedControl";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import TransactionHistoryRow from "../lists/TransactionHistoryRow";
import TransactionStatusBadge from "../status/TransactionStatusBadge";

const column = dataTableColumns<ITransaction>();

const columns: IDataTableColumn<ITransaction>[] = [
  column.display({
    id: "number",
    header: "Transaction",
    cell: ({ row }) => (
      <span className={itemIdentity}>
        <span className={itemName}>#{row.original.number}</span>
        <span className={itemMeta}>{formatDateTime(row.original.created_at)}</span>
      </span>
    ),
  }),
  column.display({
    id: "by",
    header: "By",
    cell: ({ row }) => <span className={mutedText}>{row.original.created_by_name}</span>,
  }),
  column.display({
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className={mutedText}>
        {formatCount(row.original.line_count, "item")} · {formatCount(row.original.total_quantity, "pc")}
      </span>
    ),
  }),
  column.display({
    id: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className={priceText}>
        {row.original.total_amount === null ? "—" : formatPeso(row.original.total_amount)}
      </span>
    ),
  }),
  column.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <TransactionStatusBadge status={row.original.status} />,
  }),
];

const allStatuses = "all";

const statusOptions = [
  { value: allStatuses, label: "All" },
  { value: "completed", label: transactionStatusLabels.completed },
  { value: "voided", label: transactionStatusLabels.voided },
];

const TransactionHistoryTable = () => {
  const query = useTransactionHistory();
  const { filters, setFilters } = useFilters<{ status?: TransactionStatus }>(
    transactionHistoryTableKey,
  );
  const { openModal } = useModal<ITransaction>(transactionDetailModalKey);
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <SegmentedControl
          label="Transaction status"
          value={filters.status ?? allStatuses}
          onValueChange={(next) =>
            setFilters({
              status: next === allStatuses ? undefined : (next as TransactionStatus),
            })
          }
          options={statusOptions}
          className={historyStatusTabs}
        />
      }
      footer={
        <TablePagination
          paginationKey={transactionHistoryTableKey}
          totalCount={page?.totalCount ?? 0}
          isLoading={query.isLoading}
          pageSizes={[8, 20, 50]}
        />
      }
    >
      <DataTable
        tableKey={transactionHistoryTableKey}
        label="Transactions"
        data={page?.data ?? []}
        columns={columns}
        getRowId={(transaction) => transaction.id}
        isLoading={query.isLoading}
        isStale={isShowingPausedRows(query)}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        onRowClick={(transaction) => openModal(transaction)}
        emptyText="No transactions yet."
        renderRow={(transaction) => <TransactionHistoryRow transaction={transaction} />}
      />
    </TablePanel>
  );
};

export default TransactionHistoryTable;
