import type { ReactNode } from "react";
import { usePagination } from "../../../hook/common/pagination.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useItemPickList } from "../../../hook/data/inventory/inventory.list.hook";
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
import { formatNumber } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  tableKey: string;
  label: string;
  actionTitle: string;
  renderAction: (item: IInventoryItem) => ReactNode;
  topSellersFirst?: boolean;
};

const columnsWith = (
  actionTitle: string,
  renderAction: IProps["renderAction"],
): IDataTableColumn<IInventoryItem>[] => [
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
    listRender: (item) => item.name,
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
    title: "Stock left",
    render: (_, item) => (
      <span>
        <span className={onHandValue({ status: item.stock_status })}>
          {formatNumber(item.on_hand)}
        </span>
        <span className={onHandUnit}>{item.unit}</span>
      </span>
    ),
    listRender: (item) => (
      <span className={stockStatusText({ status: item.stock_status })}>
        {formatNumber(item.on_hand)} {item.unit} left
      </span>
    ),
  },
  {
    key: "status",
    title: "Status",
    listHidden: true,
    render: (_, item) => <StockStatusBadge status={item.stock_status} />,
  },
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
}: IProps) => {
  const { query } = useItemPickList(tableKey, topSellersFirst);
  const { pagination, goToPage } = usePagination(tableKey);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <FilterToolbar>
          <FilterBar
            filterKey={tableKey}
            searchKey={tableKey}
            searchPlaceholder="Name, code or brand"
            inlineOnCompact
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
      }
    >
      <DataTable<IInventoryItem>
        label={label}
        columns={columnsWith(actionTitle, renderAction)}
        data={page?.data ?? []}
        loading={query.isLoading}
        refreshing={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        isStale={isShowingPausedRows(query)}
        pagination={pagination}
        totalCount={page?.totalCount ?? 0}
        onPageChange={goToPage}
        emptyText="No item matches. Try another name, category or brand."
      />
    </TablePanel>
  );
};

export default ItemPickerTable;
