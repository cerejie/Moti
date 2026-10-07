import { usePagination } from "../../../hook/common/pagination.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useTransactionItemList } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionPickTableKey } from "../../../keys/table.keys";
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
  stockStatusText,
} from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import { isShowingPausedRows } from "../../../utils/query.utils";
import FilterBar from "../../common/filter/FilterBar";
import FilterToolbar from "../../common/filter/FilterToolbar";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import StockStatusBadge from "../../inventory/status/StockStatusBadge";
import CartQuantityControl from "../menus/CartQuantityControl";

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
    key: "price",
    title: "Price",
    mobile: "subtitle",
    render: (_, item) => (
      <span className={priceText}>
        {item.selling_price === null ? "—" : formatPeso(item.selling_price)}
      </span>
    ),
    listRender: (item) =>
      item.selling_price === null ? "No price set" : formatPeso(item.selling_price),
  },
  {
    key: "actions",
    title: "Add",
    align: "center",
    className: nowrapCell,
    render: (_, item) => <CartQuantityControl item={item} />,
  },
];

// The seller searches, filters and adds; the cart bar below collects the lines.
const TransactionItemTable = () => {
  const query = useTransactionItemList();
  const { pagination, goToPage } = usePagination(transactionPickTableKey);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <FilterToolbar>
          <FilterBar
            filterKey={transactionPickTableKey}
            searchKey={transactionPickTableKey}
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
      }
    >
      <DataTable<IInventoryItem>
        label="Items to sell"
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
        emptyText="No item matches. Try another name, category or brand."
      />
    </TablePanel>
  );
};

export default TransactionItemTable;
