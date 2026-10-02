import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useTransactionItemList } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionPickTableKey } from "../../../keys/table.keys";
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
import { tableCellActions, tableHeadHidden } from "../../../styles/table/table.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import FilterToolbar from "../../common/filter/FilterToolbar";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import StockStatusBadge from "../../inventory/status/StockStatusBadge";
import TransactionItemCard from "../cards/TransactionItemCard";
import CartQuantityControl from "../menus/CartQuantityControl";

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
    cell: ({ row }) => (
      <span className={mutedText}>{row.original.category?.name ?? "—"}</span>
    ),
  }),
  column.display({
    id: "on_hand",
    header: "Stock left",
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
    cell: ({ row }) => <StockStatusBadge status={row.original.stock_status} />,
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
    header: () => <span className={tableHeadHidden}>Add to transaction</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <CartQuantityControl item={row.original} />
      </div>
    ),
  }),
];

// The seller searches, filters and adds; the cart bar below collects the lines.
const TransactionItemTable = () => {
  const query = useTransactionItemList();
  const { options: categoryOptions } = useCategoryOptions();
  const { options: brandOptions } = useBrandOptions();
  const page = query.data;

  return (
    <TablePanel
      toolbar={
        <FilterToolbar
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
      }
      footer={
        <TablePagination
          paginationKey={transactionPickTableKey}
          totalCount={page?.totalCount ?? 0}
          pageSizes={[8, 20, 50]}
        />
      }
    >
      <DataTable
        tableKey={transactionPickTableKey}
        label="Items to sell"
        data={page?.data ?? []}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No item matches. Try another name, category or brand."
        renderCard={(item) => <TransactionItemCard item={item} />}
      />
    </TablePanel>
  );
};

export default TransactionItemTable;
