import {
  inventoryViewLabels,
  inventoryViewValues,
  type InventoryView,
} from "../../../enums/stock.enum";
import { useModal } from "../../../hook/common/modal.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useInventoryList } from "../../../hook/data/inventory/inventory.list.hook";
import { itemDetailModalKey } from "../../../keys/modal.keys";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
  onHandUnit,
  onHandValue,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import InventoryRowActions from "../menus/InventoryRowActions";
import StockStatusBadge from "../status/StockStatusBadge";

const columns: IDataTableColumn<IInventoryItem>[] = [
  {
    key: "item",
    title: "Item",
    render: (_, item) => (
      <span className={itemIdentity}>
        <span className={itemName}>{item.name}</span>
        <span className={itemMeta}>
          {[item.item_code, item.brand?.name].filter(Boolean).join(" · ")}
        </span>
      </span>
    ),
  },
  {
    key: "category",
    title: "Category",
    collapse: "xl",
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{item.category?.name ?? "—"}</span>,
  },
  {
    key: "on_hand",
    title: "On hand",
    mobile: "amount",
    render: (_, item) => (
      <span>
        <span className={onHandValue({ status: item.stock_status })}>
          {formatNumber(item.on_hand)}
        </span>
        <span className={onHandUnit}>{item.unit}</span>
      </span>
    ),
  },
  {
    key: "status",
    title: "Status",
    mobile: "status",
    render: (_, item) => (
      <StockStatusBadge status={item.stock_status} archived={item.archived_at !== null} />
    ),
  },
  {
    key: "reorder",
    title: "Warn at",
    collapse: "xl",
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{formatNumber(item.reorder_level)}</span>,
  },
  {
    key: "price",
    title: "Price",
    listHidden: true,
    render: (_, item) => (
      <span className={priceText}>
        {item.selling_price === null ? "—" : formatPeso(item.selling_price)}
      </span>
    ),
  },
  {
    key: "actions",
    title: "Action",
    align: "center",
    className: nowrapCell,
    // Compact opens the item sheet on tap, which carries the stock actions.
    listHidden: true,
    render: (_, item) => <InventoryRowActions item={item} />,
  },
];

const viewOptions: ISegmentOption<InventoryView>[] = inventoryViewValues.map((key) => ({
  key,
  label: inventoryViewLabels[key],
}));

const emptyTextByView: Record<InventoryView, string> = {
  all: "No items yet. Add your first item to start tracking stock.",
  low: "Nothing is running low.",
  out: "Nothing is out of stock.",
  archived: "No archived items.",
};

const InventoryTable = () => {
  const { query, view, setView } = useInventoryList();
  const { pagination, goToPage } = usePagination(inventoryTableKey);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const detailModal = useModal<IInventoryItem>(itemDetailModalKey);
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <>
          <ContextSwitch
            label="Stock status"
            value={view}
            options={viewOptions}
            onChange={setView}
          />
          <FilterToolbar>
            <FilterBar
              filterKey={inventoryTableKey}
              searchKey={inventoryTableKey}
              searchPlaceholder="Search name, item code or brand"
              controls={[
                {
                  key: "categoryId",
                  label: "Category",
                  placeholder: "All categories",
                  options: categoryOptions,
                },
                {
                  key: "brandId",
                  label: "Brand",
                  placeholder: "All brands",
                  options: brandOptions,
                },
              ]}
            />
          </FilterToolbar>
        </>
      }
    >
      <DataTable<IInventoryItem>
        label="Inventory items"
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
        onRowClick={(item) => detailModal.openModal(item)}
        emptyText={emptyTextByView[view]}
      />
    </TablePanel>
  );
};

export default InventoryTable;
