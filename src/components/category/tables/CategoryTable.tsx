import { Pencil, Shapes, Trash2 } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCategoryDelete } from "../../../hook/data/category/category.form.hook";
import { useCategoryList } from "../../../hook/data/category/category.list.hook";
import { categoryFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { ICategory } from "../../../models/data/category/category.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatCount, formatNumber, formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";

const itemCountOf = (category: ICategory) => category.inventory_items[0]?.count ?? 0;

const buildColumns = (
  actionsOf: (category: ICategory) => IRowAction[],
): IDataTableColumn<ICategory>[] => [
  {
    key: "name",
    title: "Category",
    render: (_, category) => <span className={itemName}>{category.name}</span>,
    listRender: (category) => category.name,
  },
  {
    key: "items",
    title: "Items",
    mobile: "status",
    render: (_, category) => <span className={mutedText}>{formatNumber(itemCountOf(category))}</span>,
    listRender: (category) => <span className={mutedText}>{formatCount(itemCountOf(category), "item")}</span>,
  },
  {
    key: "created",
    title: "Added",
    render: (_, category) => <span className={mutedText}>{formatShortDate(category.created_at)}</span>,
    listRender: (category) => `Added ${formatShortDate(category.created_at)}`,
  },
  {
    key: "actions",
    title: "Action",
    align: "center",
    className: nowrapCell,
    render: (_, category) => (
      <RowActionMenu label={`Manage ${category.name}`} actions={actionsOf(category)} />
    ),
  },
];

const detailSections: IDetailSection<ICategory>[] = [
  {
    key: "category",
    title: "Category",
    icon: <Shapes />,
    items: [
      { key: "items", label: "Items", render: (category) => formatCount(itemCountOf(category), "item") },
      { key: "created", label: "Added", render: (category) => formatShortDate(category.created_at) },
    ],
  },
];

const CategoryTable = () => {
  const query = useCategoryList();
  const { openModal } = useModal<ICategory>(categoryFormModalKey);
  const remove = useCategoryDelete();

  // The row menu (wide) and the detail sheet footer (compact) share this list.
  const actionsOf = (category: ICategory): IRowAction[] => [
    { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openModal(category) },
    { key: "delete", label: "Delete", icon: <Trash2 />, danger: true, onSelect: () => remove(category) },
  ];

  return (
    <TablePanel>
      <DataTable<ICategory>
        label="Categories"
        columns={buildColumns(actionsOf)}
        data={query.data ?? []}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        detailSections={detailSections}
        detailTitle={(category) => category.name}
        detailActions={actionsOf}
        emptyText="No categories yet. Add one to group your items."
      />
    </TablePanel>
  );
};

export default CategoryTable;
