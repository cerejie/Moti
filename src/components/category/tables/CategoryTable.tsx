import { Pencil, Trash2 } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCategoryDelete } from "../../../hook/data/category/category.form.hook";
import { useCategoryList } from "../../../hook/data/category/category.list.hook";
import { categoryFormModalKey } from "../../../keys/modal.keys";
import { categoryTableKey } from "../../../keys/table.keys";
import type { ICategory } from "../../../models/data/category/category.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { tableCellActions, tableHeadHidden } from "../../../styles/table/table.styles";
import { formatNumber, formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";

const column = dataTableColumns<ICategory>();

const itemCountOf = (category: ICategory) => category.inventory_items[0]?.count ?? 0;

const CategoryActions = ({ category }: { category: ICategory }) => {
  const { openModal } = useModal<ICategory>(categoryFormModalKey);
  const remove = useCategoryDelete();

  return (
    <RowActionMenu
      label={category.name}
      actions={[
        { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openModal(category) },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 />,
          danger: true,
          onSelect: () => remove(category),
        },
      ]}
    />
  );
};

const columns: IDataTableColumn<ICategory>[] = [
  column.display({
    id: "name",
    header: "Category",
    cell: ({ row }) => <span className={itemName}>{row.original.name}</span>,
  }),
  column.display({
    id: "items",
    header: "Items",
    cell: ({ row }) => <span className={mutedText}>{formatNumber(itemCountOf(row.original))}</span>,
  }),
  column.display({
    id: "created",
    header: "Added",
    cell: ({ row }) => <span className={mutedText}>{formatShortDate(row.original.created_at)}</span>,
  }),
  column.display({
    id: "actions",
    header: () => <span className={tableHeadHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <CategoryActions category={row.original} />
      </div>
    ),
  }),
];

const CategoryTable = () => {
  const query = useCategoryList();

  return (
    <TablePanel>
      <DataTable
        tableKey={categoryTableKey}
        label="Categories"
        data={query.data ?? []}
        columns={columns}
        getRowId={(category) => category.id}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No categories yet. Add one to group your items."
      />
    </TablePanel>
  );
};

export default CategoryTable;
