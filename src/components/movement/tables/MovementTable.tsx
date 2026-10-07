import {
  movementReasonLabels,
  movementReasonTones,
  movementTypeLabels,
  type MovementType,
} from "../../../enums/stock.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useMovementList } from "../../../hook/data/movement/movement.list.hook";
import { movementTableKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import {
  historyQuantity,
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
} from "../../../styles/inventory/inventory.styles";
import { movementByCell, movementNote } from "../../../styles/movement/movement.styles";
import { formatDateTime, formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import StatusBadge from "../../common/status/StatusBadge";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";

const columns: IDataTableColumn<IStockMovement>[] = [
  {
    key: "date",
    title: "When",
    mobile: "meta",
    render: (_, movement) => (
      <span className={mutedText}>{formatDateTime(movement.created_at)}</span>
    ),
    listRender: (movement) => formatDateTime(movement.created_at),
  },
  {
    key: "item",
    title: "Item",
    mobile: "title",
    render: (_, movement) => (
      <span className={itemIdentity}>
        <span className={itemName}>{movement.item?.name ?? "Deleted item"}</span>
        <span className={itemMeta}>{movement.item?.item_code ?? ""}</span>
      </span>
    ),
    listRender: (movement) => movement.item?.name ?? "Deleted item",
  },
  {
    key: "reason",
    title: "Reason",
    mobile: "subtitle",
    render: (_, movement) => (
      <StatusBadge tone={movementReasonTones[movement.reason]}>
        {movementReasonLabels[movement.reason]}
      </StatusBadge>
    ),
    listRender: (movement) => movementReasonLabels[movement.reason],
  },
  {
    key: "quantity",
    title: "Qty",
    align: "right",
    mobile: "amount",
    render: (_, movement) => (
      <span className={historyQuantity({ direction: movement.quantity > 0 ? "in" : "out" })}>
        {formatSignedQuantity(movement.quantity)}
      </span>
    ),
  },
  {
    key: "balance",
    title: "Left",
    collapse: "xl",
    mobile: "status",
    render: (_, movement) => (
      <span className={mutedText}>
        {formatNumber(movement.balance_after)} {movement.item?.unit ?? ""}
      </span>
    ),
    listRender: (movement) => (
      <span className={mutedText}>
        {formatNumber(movement.balance_after)} {movement.item?.unit ?? ""} left
      </span>
    ),
  },
  {
    key: "by",
    title: "By",
    render: (_, movement) => (
      <span className={movementByCell}>
        <span>{movement.created_by_name}</span>
        {movement.note && <span className={movementNote}>{movement.note}</span>}
      </span>
    ),
    listRender: (movement) => movement.created_by_name,
  },
];

const allTypes = "all";

type ITypeChoice = MovementType | typeof allTypes;

const typeOptions: ISegmentOption<ITypeChoice>[] = [
  { key: allTypes, label: "All" },
  { key: "stock_in", label: movementTypeLabels.stock_in },
  { key: "stock_out", label: movementTypeLabels.stock_out },
];

const MovementTable = () => {
  const query = useMovementList();
  const { pagination, goToPage } = usePagination(movementTableKey);
  const { filters, setFilters } = useFilters<{ type?: MovementType }>(movementTableKey);
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <ContextSwitch
          label="Movement type"
          value={filters.type ?? allTypes}
          options={typeOptions}
          onChange={(next) => setFilters({ type: next === allTypes ? undefined : next })}
        />
      }
    >
      <DataTable<IStockMovement>
        label="Stock movements"
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
        emptyText="No stock movements yet."
      />
    </TablePanel>
  );
};

export default MovementTable;
