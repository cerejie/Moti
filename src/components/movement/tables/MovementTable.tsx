import {
  movementReasonLabels,
  movementReasonTones,
  movementViewLabels,
  movementViewValues,
  type MovementView,
} from "../../../enums/stock.enum";
import { usePagination } from "../../../hook/common/pagination.hook";
import {
  movementPageDefaults,
  useMovementList,
} from "../../../hook/data/movement/movement.list.hook";
import { useUserOptions } from "../../../hook/data/user/user.list.hook";
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
import { movementPath, transactionPath } from "../../../utils/route.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import StatusBadge from "../../common/status/StatusBadge";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";

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

const viewOptions: ISegmentOption<MovementView>[] = movementViewValues.map((key) => ({
  key,
  label: movementViewLabels[key],
}));

const emptyTextByView: Record<MovementView, string> = {
  changes: "No stock changes yet.",
  deliveries: "No deliveries yet.",
  counts: "No stock counts yet.",
  damaged: "Nothing damaged or lost.",
  sales: "No sales yet.",
};

// A sale's own page tells the whole story, so its rows open that instead of the single line.
const pathOf = (movement: IStockMovement) =>
  movement.transaction_id ? transactionPath(movement.transaction_id) : movementPath(movement.id);

const MovementTable = () => {
  const { query, view, setView, narrowed } = useMovementList();
  const navigate = useTransitionNavigate();
  const { pagination, goToPage } = usePagination(movementTableKey, movementPageDefaults);
  const { options: personOptions } = useUserOptions();
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <>
          <ContextSwitch
            label="Kind of stock change"
            value={view}
            options={viewOptions}
            onChange={setView}
          />
          <FilterToolbar>
            <FilterBar
              filterKey={movementTableKey}
              searchKey={movementTableKey}
              searchPlaceholder="Item name or code"
              controls={[
                {
                  key: "personId",
                  label: "Person",
                  placeholder: "Everyone",
                  options: personOptions,
                },
              ]}
            />
          </FilterToolbar>
        </>
      }
    >
      <DataTable<IStockMovement>
        label="Stock history"
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
        emptyText={narrowed ? "Nothing matches. Try another item or person." : emptyTextByView[view]}
        onRowClick={(movement) => void navigate(pathOf(movement))}
      />
    </TablePanel>
  );
};

export default MovementTable;
