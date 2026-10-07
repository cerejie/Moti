import {
  transactionStatusLabels,
  type TransactionStatus,
} from "../../../enums/transaction.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useTransactionHistory } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionDetailModalKey } from "../../../keys/modal.keys";
import { transactionHistoryTableKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import {
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { formatCount, formatDateTime, formatPeso } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import TransactionStatusBadge from "../status/TransactionStatusBadge";

const columns: IDataTableColumn<ITransaction>[] = [
  {
    key: "number",
    title: "Transaction",
    render: (_, transaction) => (
      <span className={itemIdentity}>
        <span className={itemName}>#{transaction.number}</span>
        <span className={itemMeta}>{formatDateTime(transaction.created_at)}</span>
      </span>
    ),
  },
  {
    key: "by",
    title: "By",
    render: (_, transaction) => (
      <span className={mutedText}>{transaction.created_by_name}</span>
    ),
    listRender: (transaction) => transaction.created_by_name,
  },
  {
    key: "items",
    title: "Items",
    listHidden: true,
    render: (_, transaction) => (
      <span className={mutedText}>
        {formatCount(transaction.line_count, "item")} ·{" "}
        {formatCount(transaction.total_quantity, "pc")}
      </span>
    ),
  },
  {
    key: "total",
    title: "Total",
    align: "right",
    mobile: "amount",
    render: (_, transaction) => (
      <span className={priceText}>
        {transaction.total_amount === null ? "—" : formatPeso(transaction.total_amount)}
      </span>
    ),
  },
  {
    key: "status",
    title: "Status",
    mobile: "status",
    render: (_, transaction) => <TransactionStatusBadge status={transaction.status} />,
  },
];

const allStatuses = "all";

type IStatusChoice = TransactionStatus | typeof allStatuses;

const statusOptions: ISegmentOption<IStatusChoice>[] = [
  { key: allStatuses, label: "All" },
  { key: "completed", label: transactionStatusLabels.completed },
  { key: "voided", label: transactionStatusLabels.voided },
];

const TransactionHistoryTable = () => {
  const query = useTransactionHistory();
  const { pagination, goToPage } = usePagination(transactionHistoryTableKey);
  const { filters, setFilters } = useFilters<{ status?: TransactionStatus }>(
    transactionHistoryTableKey,
  );
  const { openModal } = useModal<ITransaction>(transactionDetailModalKey);
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <ContextSwitch
          label="Transaction status"
          value={filters.status ?? allStatuses}
          options={statusOptions}
          onChange={(next) =>
            setFilters({ status: next === allStatuses ? undefined : next })
          }
        />
      }
    >
      <DataTable<ITransaction>
        label="Transactions"
        columns={columns}
        data={page?.data ?? []}
        loading={query.isLoading}
        refreshing={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        isStale={isShowingPausedRows(query)}
        pagination={pagination}
        totalCount={page?.totalCount ?? 0}
        onPageChange={goToPage}
        onRowClick={(transaction) => openModal(transaction)}
        emptyText="No transactions yet."
      />
    </TablePanel>
  );
};

export default TransactionHistoryTable;
