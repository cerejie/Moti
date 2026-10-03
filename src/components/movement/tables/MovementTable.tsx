import {
  movementReasonLabels,
  movementReasonTones,
  movementTypeLabels,
  type MovementType,
} from "../../../enums/stock.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { useMovementList } from "../../../hook/data/movement/movement.list.hook";
import { movementTableKey } from "../../../keys/table.keys";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import {
  historyQuantity,
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
} from "../../../styles/inventory/inventory.styles";
import { movementByCell, movementNote, movementTypeTabs } from "../../../styles/movement/movement.styles";
import { formatDateTime, formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import SegmentedControl from "../../common/filter/SegmentedControl";
import StatusBadge from "../../common/status/StatusBadge";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import MovementRow from "../lists/MovementRow";

const column = dataTableColumns<IStockMovement>();

const columns: IDataTableColumn<IStockMovement>[] = [
  column.display({
    id: "date",
    header: "When",
    cell: ({ row }) => <span className={mutedText}>{formatDateTime(row.original.created_at)}</span>,
  }),
  column.display({
    id: "item",
    header: "Item",
    cell: ({ row }) => (
      <span className={itemIdentity}>
        <span className={itemName}>{row.original.item?.name ?? "Deleted item"}</span>
        <span className={itemMeta}>{row.original.item?.item_code ?? ""}</span>
      </span>
    ),
  }),
  column.display({
    id: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <StatusBadge tone={movementReasonTones[row.original.reason]}>
        {movementReasonLabels[row.original.reason]}
      </StatusBadge>
    ),
  }),
  column.display({
    id: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <span className={historyQuantity({ direction: row.original.quantity > 0 ? "in" : "out" })}>
        {formatSignedQuantity(row.original.quantity)}
      </span>
    ),
  }),
  column.display({
    id: "balance",
    header: "Left",
    meta: { hideBelow: "xl" },
    cell: ({ row }) => (
      <span className={mutedText}>
        {formatNumber(row.original.balance_after)} {row.original.item?.unit ?? ""}
      </span>
    ),
  }),
  column.display({
    id: "by",
    header: "By",
    cell: ({ row }) => (
      <span className={movementByCell}>
        <span>{row.original.created_by_name}</span>
        {row.original.note && <span className={movementNote}>{row.original.note}</span>}
      </span>
    ),
  }),
];

const allTypes = "all";

const typeOptions = [
  { value: allTypes, label: "All" },
  { value: "stock_in", label: movementTypeLabels.stock_in },
  { value: "stock_out", label: movementTypeLabels.stock_out },
];

const MovementTable = () => {
  const query = useMovementList();
  const { filters, setFilters } = useFilters<{ type?: MovementType }>(movementTableKey);
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <SegmentedControl
          label="Movement type"
          value={filters.type ?? allTypes}
          onValueChange={(next) =>
            setFilters({ type: next === allTypes ? undefined : (next as MovementType) })
          }
          options={typeOptions}
          className={movementTypeTabs}
        />
      }
      footer={
        <TablePagination
          paginationKey={movementTableKey}
          totalCount={page?.totalCount ?? 0}
          isLoading={query.isLoading}
          pageSizes={[8, 20, 50]}
        />
      }
    >
      <DataTable
        tableKey={movementTableKey}
        label="Stock movements"
        data={page?.data ?? []}
        columns={columns}
        getRowId={(movement) => movement.id}
        isLoading={query.isLoading}
        isStale={isShowingPausedRows(query)}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No stock movements yet."
        renderRow={(movement) => <MovementRow movement={movement} />}
      />
    </TablePanel>
  );
};

export default MovementTable;
