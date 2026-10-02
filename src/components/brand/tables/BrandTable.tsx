import { Pencil, Trash2 } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useBrandDelete } from "../../../hook/data/brand/brand.form.hook";
import { useBrandList } from "../../../hook/data/brand/brand.list.hook";
import { brandFormModalKey } from "../../../keys/modal.keys";
import { brandTableKey } from "../../../keys/table.keys";
import type { IBrand } from "../../../models/data/brand/brand.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { tableCellActions, tableHeadHidden } from "../../../styles/table/table.styles";
import { formatNumber, formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import MasterfileCard from "../../masterfile/cards/MasterfileCard";

const column = dataTableColumns<IBrand>();

const itemCountOf = (brand: IBrand) => brand.inventory_items[0]?.count ?? 0;

const BrandActions = ({ brand }: { brand: IBrand }) => {
  const { openModal } = useModal<IBrand>(brandFormModalKey);
  const remove = useBrandDelete();

  return (
    <RowActionMenu
      label={brand.name}
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
  column.display({
    id: "name",
    header: "Brand",
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
        <BrandActions brand={row.original} />
      </div>
    ),
  }),
];

const BrandTable = () => {
  const query = useBrandList();

  return (
    <TablePanel>
      <DataTable
        tableKey={brandTableKey}
        label="Brands"
        data={query.data ?? []}
        columns={columns}
        getRowId={(brand) => brand.id}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No brands yet. Add one here or type a new brand on the item form."
        renderCard={(brand) => (
          <MasterfileCard
            name={brand.name}
            itemCount={itemCountOf(brand)}
            createdAt={brand.created_at}
            actions={<BrandActions brand={brand} />}
          />
        )}
      />
    </TablePanel>
  );
};

export default BrandTable;
