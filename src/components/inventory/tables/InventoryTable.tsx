import {
  inventoryViewLabels,
  inventoryViewValues,
  type InventoryView,
} from "../../../enums/stock.enum";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useInventoryList } from "../../../hook/data/inventory/inventory.list.hook";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  inventoryViewTabs,
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
  onHandUnit,
  onHandValue,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { tableCellActions, tableHeadHidden } from "../../../styles/table/table.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SegmentedControl from "../../common/filter/SegmentedControl";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import InventoryItemRow from "../lists/InventoryItemRow";
import InventoryRowActions from "../menus/InventoryRowActions";
import StockStatusBadge from "../status/StockStatusBadge";

const column = dataTableColumns<IInventoryItem>();

const columns: IDataTableColumn<IInventoryItem>[] = [
  column.display({
    id: "item",
    header: "Item",
    cell: ({ row }) => (
      <span className={itemIdentity}>
        <span className={itemName}>{row.original.name}</span>
        <span className={itemMeta}>
          {[row.original.item_code, row.original.brand?.name]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
    ),
  }),
  column.display({
    id: "category",
    header: "Category",
    meta: { hideBelow: "xl" },
    cell: ({ row }) => (
      <span className={mutedText}>{row.original.category?.name ?? "—"}</span>
    ),
  }),
  column.display({
    id: "on_hand",
    header: "On hand",
    cell: ({ row }) => (
      <span>
        <span className={onHandValue({ status: row.original.stock_status })}>
          {formatNumber(row.original.on_hand)}
        </span>
        <span className={onHandUnit}>{row.original.unit}</span>
      </span>
    ),
  }),
  column.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StockStatusBadge
        status={row.original.stock_status}
        archived={row.original.archived_at !== null}
      />
    ),
  }),
  column.display({
    id: "reorder",
    header: "Warn at",
    meta: { hideBelow: "xl" },
    cell: ({ row }) => (
      <span className={mutedText}>{formatNumber(row.original.reorder_level)}</span>
    ),
  }),
  column.display({
    id: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className={priceText}>
        {row.original.selling_price === null ? "—" : formatPeso(row.original.selling_price)}
      </span>
    ),
  }),
  column.display({
    id: "actions",
    header: () => <span className={tableHeadHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <InventoryRowActions item={row.original} />
      </div>
    ),
  }),
];

const viewOptions = inventoryViewValues.map((value) => ({
  value,
  label: inventoryViewLabels[value],
}));

const emptyTextByView: Record<InventoryView, string> = {
  all: "No items yet. Add your first item to start tracking stock.",
  low: "Nothing is running low.",
  out: "Nothing is out of stock.",
  archived: "No archived items.",
};

const InventoryTable = () => {
  const { query, view, setView } = useInventoryList();
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <FilterToolbar
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
        >
          <SegmentedControl
            label="Stock status"
            value={view}
            onValueChange={(next) => setView(next as InventoryView)}
            options={viewOptions}
            className={inventoryViewTabs}
          />
        </FilterToolbar>
      }
      footer={
        <TablePagination
          paginationKey={inventoryTableKey}
          totalCount={page?.totalCount ?? 0}
          pageSizes={[8, 20, 50]}
        />
      }
    >
      <DataTable
        tableKey={inventoryTableKey}
        label="Inventory items"
        data={page?.data ?? []}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText={emptyTextByView[view]}
        renderRow={(item) => <InventoryItemRow item={item} />}
      />
    </TablePanel>
  );
};

export default InventoryTable;
