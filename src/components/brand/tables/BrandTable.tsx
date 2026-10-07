import { Pencil, Trash2 } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useBrandDelete } from "../../../hook/data/brand/brand.form.hook";
import { useBrandList } from "../../../hook/data/brand/brand.list.hook";
import { brandFormModalKey } from "../../../keys/modal.keys";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IBrand } from "../../../models/data/brand/brand.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatCount, formatNumber, formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";

const itemCountOf = (brand: IBrand) => brand.inventory_items[0]?.count ?? 0;

const BrandActions = ({ brand }: { brand: IBrand }) => {
  const { openModal } = useModal<IBrand>(brandFormModalKey);
  const remove = useBrandDelete();

  return (
    <RowActionMenu
      label={`Manage ${brand.name}`}
      actions={[
        { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openModal(brand) },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 />,
          danger: true,
          onSelect: () => remove(brand),
        },
      ]}
    />
  );
};

const columns: IDataTableColumn<IBrand>[] = [
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
    render: (_, brand) => <BrandActions brand={brand} />,
  },
];

const BrandTable = () => {
  const query = useBrandList();

  return (
    <TablePanel>
      <DataTable<IBrand>
        label="Brands"
        columns={columns}
        data={query.data ?? []}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No brands yet. Add one here or type a new brand on the item form."
      />
    </TablePanel>
  );
};

export default BrandTable;
