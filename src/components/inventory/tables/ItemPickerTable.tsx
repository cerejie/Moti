import type { ReactNode } from "react";
import { stockStatusLabels } from "../../../enums/stock.enum";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useItemPickList } from "../../../hook/data/inventory/inventory.list.hook";
import type { IFilterControl } from "../../../models/common/filter.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
  onHandUnit,
  onHandValue,
  stockStatusText,
} from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatNumber, formatQuantity } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import ColumnFilterMenu from "../../common/table/ColumnFilterMenu";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  tableKey: string;
  label: string;
  actionTitle: string;
  renderAction: (item: IInventoryItem) => ReactNode;
  topSellersFirst?: boolean;
  // Shows that branch's stock instead of the all-branches total.
  branchId?: string;
  // Sell drops it: the colour of the stock count already says Low or Out.
  hideStatus?: boolean;
};

type IColumnOptions = Pick<IProps, "tableKey" | "actionTitle" | "renderAction" | "hideStatus"> & {
  categoryControl: IFilterControl;
  brandControl: IFilterControl;
};

// Where the status column is hidden, Low and Out still say so in words, never colour alone.
const statusWord = (item: IInventoryItem) =>
  item.stock_status === "in_stock" ? "" : ` · ${stockStatusLabels[item.stock_status]}`;

const columnsWith = ({
  tableKey,
  actionTitle,
  renderAction,
  hideStatus,
  categoryControl,
  brandControl,
}: IColumnOptions): IDataTableColumn<IInventoryItem>[] => [
  {
    key: "item",
    title: "Product",
    render: (_, item) => (
      <span className={itemIdentity}>
        <span className={itemName}>{item.name}</span>
        <span className={itemMeta}>{item.item_code}</span>
      </span>
    ),
    listRender: (item) => item.name,
  },
  {
    key: "category",
    title: <ColumnFilterMenu filterKey={tableKey} control={categoryControl} />,
    collapse: "xl",
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{item.category?.name ?? "—"}</span>,
  },
  {
    key: "brand",
    title: <ColumnFilterMenu filterKey={tableKey} control={brandControl} />,
    collapse: "xl",
    listHidden: true,
    render: (_, item) => <span className={mutedText}>{item.brand?.name ?? "—"}</span>,
  },
  {
    key: "on_hand",
    title: "Available",
    render: (_, item) => (
      <span>
        <span className={onHandValue({ status: item.stock_status })}>
          {formatNumber(item.on_hand)}
        </span>
        <span className={onHandUnit}>{item.unit}</span>
        {hideStatus && <span className={stockStatusText({ status: item.stock_status })}>{statusWord(item)}</span>}
      </span>
    ),
    // Phones: the code, then what is available, coloured and named only when Low or Out.
    listRender: (item) => (
      <span>
        {item.item_code} ·{" "}
        <span className={stockStatusText({ status: item.stock_status })}>
          {formatQuantity(item.on_hand, item.unit)} available{statusWord(item)}
        </span>
      </span>
    ),
  },
  ...(hideStatus
    ? []
    : [
        {
          key: "status",
          title: "Status",
          listHidden: true,
          render: (_: unknown, item: IInventoryItem) => (
            <StockStatusBadge status={item.stock_status} />
          ),
        },
      ]),
  {
    key: "actions",
    title: actionTitle,
    align: "center",
    className: nowrapCell,
    render: (_, item) => renderAction(item),
  },
];

// Search, filter and pick: the list behind Sell, Receive delivery, Count stock and
// Damaged or lost. Each keeps its own search, filters and page under its table key.
const ItemPickerTable = ({
  tableKey,
  label,
  actionTitle,
  renderAction,
  topSellersFirst = false,
  branchId,
  hideStatus = false,
}: IProps) => {
  const { query } = useItemPickList(tableKey, topSellersFirst, branchId);
  const { pagination, goToPage } = usePagination(tableKey);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
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

  return (
    <TablePanel
      toolbar={
        <FilterToolbar>
          <FilterBar
            filterKey={tableKey}
            searchKey={tableKey}
            searchPlaceholder="Search product, code or brand"
            inlineOnCompact
            controls={[categoryControl, brandControl]}
          />
        </FilterToolbar>
      }
    >
      <DataTable<IInventoryItem>
        label={label}
        columns={columnsWith({
          tableKey,
          actionTitle,
          renderAction,
          hideStatus,
          categoryControl,
          brandControl,
        })}
        data={page?.data ?? []}
        loading={query.isLoading}
        refreshing={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        isStale={isShowingPausedRows(query)}
        pagination={pagination}
        totalCount={page?.totalCount ?? 0}
        onPageChange={goToPage}
        emptyText="No product matches. Try another name, code, category or brand."
      />
    </TablePanel>
  );
};

export default ItemPickerTable;
