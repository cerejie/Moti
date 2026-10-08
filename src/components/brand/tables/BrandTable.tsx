import { Pencil, Tag, Trash2 } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useBrandDelete } from "../../../hook/data/brand/brand.form.hook";
import { useBrandList } from "../../../hook/data/brand/brand.list.hook";
import { brandFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IBrand } from "../../../models/data/brand/brand.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatCount, formatNumber, formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";

const itemCountOf = (brand: IBrand) => brand.inventory_items[0]?.count ?? 0;

const buildColumns = (
  actionsOf: (brand: IBrand) => IRowAction[],
): IDataTableColumn<IBrand>[] => [
  {
    key: "name",
    title: "Brand",
    render: (_, brand) => <span className={itemName}>{brand.name}</span>,
    listRender: (brand) => brand.name,
  },
  {
    key: "items",
    title: "Items",
    mobile: "status",
    render: (_, brand) => <span className={mutedText}>{formatNumber(itemCountOf(brand))}</span>,
    listRender: (brand) => <span className={mutedText}>{formatCount(itemCountOf(brand), "item")}</span>,
  },
  {
    key: "created",
    title: "Added",
    render: (_, brand) => <span className={mutedText}>{formatShortDate(brand.created_at)}</span>,
    listRender: (brand) => `Added ${formatShortDate(brand.created_at)}`,
  },
  {
    key: "actions",
    title: "Action",
    align: "center",
    className: nowrapCell,
    render: (_, brand) => (
      <RowActionMenu label={`Manage ${brand.name}`} actions={actionsOf(brand)} />
    ),
  },
];

const detailSections: IDetailSection<IBrand>[] = [
  {
    key: "brand",
    title: "Brand",
    icon: <Tag />,
    items: [
      { key: "items", label: "Items", render: (brand) => formatCount(itemCountOf(brand), "item") },
      { key: "created", label: "Added", render: (brand) => formatShortDate(brand.created_at) },
    ],
  },
];

const BrandTable = () => {
  const query = useBrandList();
  const { openModal } = useModal<IBrand>(brandFormModalKey);
  const remove = useBrandDelete();

  // The row menu (wide) and the detail sheet footer (compact) share this list.
  const actionsOf = (brand: IBrand): IRowAction[] => [
    { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openModal(brand) },
    { key: "delete", label: "Delete", icon: <Trash2 />, danger: true, onSelect: () => remove(brand) },
  ];

  return (
    <TablePanel>
      <DataTable<IBrand>
        label="Brands"
        columns={buildColumns(actionsOf)}
        data={query.data ?? []}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        detailSections={detailSections}
        detailTitle={(brand) => brand.name}
        detailActions={actionsOf}
        emptyText="No brands yet. Add one here or type a new brand on the item form."
      />
    </TablePanel>
  );
};

export default BrandTable;
