import {
  archivedShowValue,
  inventoryViewLabels,
  inventoryViewValues,
  type InventoryView,
} from "../../../enums/stock.enum";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import {
  useInventoryList,
  useInventorySummary,
} from "../../../hook/data/inventory/inventory.list.hook";
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { IFilterControl } from "../../../models/common/filter.model";
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
} from "../../../styles/inventory/inventory.styles";
import { formatNumber } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import { itemPath } from "../../../utils/route.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import ColumnFilterMenu from "../../common/table/ColumnFilterMenu";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import StockStatusBadge from "../status/StockStatusBadge";

const renderAvailable = (item: IInventoryItem) => (
  <span>
    <span className={onHandValue({ status: item.stock_status })}>
      {formatNumber(item.on_hand)}
    </span>
    <span className={onHandUnit}>{item.unit}</span>
  </span>
);

const renderIdentity = (item: IInventoryItem, meta: string) => (
  <span className={itemIdentity}>
    <span className={itemName}>{item.name}</span>
    <span className={itemMeta}>{meta}</span>
  </span>
);

// A row opens the product; every stock action lives there, not on the row.
// Category and Brand titles filter their column, sharing the toolbar's filter values.
const columnsWith = (
  categoryControl: IFilterControl,
  brandControl: IFilterControl,
): IDataTableColumn<IInventoryItem>[] => [
  {
    key: "item",
    title: "Product",
    render: (_, item) => renderIdentity(item, item.item_code),
    // Phones have no Brand column, so the brand stays beside the code.
    listRender: (item) =>
      renderIdentity(item, [item.item_code, item.brand?.name].filter(Boolean).join(" · ")),
  },
  {
    key: "category",
    title: <ColumnFilterMenu filterKey={inventoryTableKey} control={categoryControl} />,
    collapse: "xl",
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{item.category?.name ?? "—"}</span>,
  },
  {
    key: "brand",
    title: <ColumnFilterMenu filterKey={inventoryTableKey} control={brandControl} />,
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{item.brand?.name ?? "—"}</span>,
  },
  {
    key: "on_hand",
    title: "Available",
    mobile: "amount",
    render: (_, item) => renderAvailable(item),
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
    title: "Low-stock alert at",
    collapse: "xl",
    listHidden: true,
    render: (_, item) => (
      <span className={mutedText}>
        {formatNumber(item.reorder_level)} {item.unit}
      </span>
    ),
  },
];

const emptyTextByView: Record<InventoryView, string> = {
  all: "No products yet. Add your first product to start tracking stock.",
  low: "Nothing is running low.",
  out: "Nothing is out of stock.",
};

const InventoryTable = () => {
  const { query, view, archived, setView } = useInventoryList();
  const summary = useInventorySummary();
  const { pagination, goToPage } = usePagination(inventoryTableKey);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const navigate = useTransitionNavigate();
  const page = query.data;

  const categoryControl: IFilterControl = {
    key: "categoryId",
    label: "Category",
    placeholder: "All categories",
    options: categoryOptions,
  };
  const brandControl: IFilterControl = {
    key: "brandId",
    label: "Brand",
    placeholder: "All brands",
    options: brandOptions,
  };

  // The counts are the summary: tapping one filters to it. They describe active products only,
  // and a zero is left off so only a real problem draws the eye.
  const countOf: Partial<Record<InventoryView, number | undefined>> = archived
    ? {}
    : { low: summary.data?.low_count, out: summary.data?.out_count };
  const viewOptions: ISegmentOption<InventoryView>[] = inventoryViewValues.map((key) => {
    const count = countOf[key];
    return { key, label: inventoryViewLabels[key], count: count ? count : undefined };
  });

  return (
    <TablePanel
      fill
      toolbar={
        <>
          <ContextSwitch
            label="Stock status"
            value={view}
            options={viewOptions}
            onChange={setView}
            chips
          />
          <FilterToolbar>
            <FilterBar
              filterKey={inventoryTableKey}
              searchKey={inventoryTableKey}
              searchPlaceholder="Search product, code or brand"
              controls={[
                categoryControl,
                brandControl,
                {
                  key: "show",
                  label: "Show",
                  placeholder: "Active products",
                  options: [{ value: archivedShowValue, label: "Archived products" }],
                },
              ]}
            />
          </FilterToolbar>
        </>
      }
    >
      <DataTable<IInventoryItem>
        label={archived ? "Archived products" : "Products"}
        columns={columnsWith(categoryControl, brandControl)}
        data={page?.data ?? []}
        loading={query.isLoading}
        refreshing={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        isStale={isShowingPausedRows(query)}
        pagination={pagination}
        totalCount={page?.totalCount ?? 0}
        onPageChange={goToPage}
        onRowClick={(item) => void navigate(itemPath(item.id))}
        emptyText={archived ? "No archived products." : emptyTextByView[view]}
        fill
      />
    </TablePanel>
  );
};

export default InventoryTable;
