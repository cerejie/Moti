import {
  Archive,
  ArchiveRestore,
  PackageMinus,
  PackagePlus,
  Pencil,
  ShoppingCart,
} from "lucide-react";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { stockStatusLabels, stockStatusTones } from "../../../enums/inventory.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { useItemArchive, useItemFormModal } from "../../../hook/data/inventory/inventory.form.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { formatPeso } from "../../../utils/format.utils";
import {
  tableCellActions,
  tableCellNumeric,
} from "../../../styles/table/table.styles";
import {
  itemCell,
  itemMeta,
  itemName,
  itemStockStack,
  itemStockUnit,
  itemStockValue,
  visuallyHidden,
} from "../../../styles/inventory/inventory.styles";

type IProps = {
  items: IInventoryItem[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  canManage: boolean;
  onOpen: (item: IInventoryItem) => void;
  emptyText: string;
};

const column = dataTableColumns<IInventoryItem>();

const metaLine = (item: IInventoryItem) =>
  [item.item_code, item.brand, item.fitment].filter(Boolean).join(" · ");

const InventoryTable = ({
  items,
  isLoading,
  isError,
  error,
  onRetry,
  canManage,
  onOpen,
  emptyText,
}: IProps) => {
  const isMobile = useIsMobile();
  const { openEdit } = useItemFormModal();
  const { archive, restore } = useItemArchive();
  const { openSale, openAdd, openDeduct } = useStockMovementModal();

  // Only managers get this menu; an archived item takes no stock until restored.
  const stockActionsFor = (item: IInventoryItem): IRowAction[] =>
    item.archived_at
      ? []
      : [
          {
            key: "sell",
            label: "Sell",
            icon: <ShoppingCart />,
            disabled: item.on_hand === 0,
            onSelect: () => openSale(item),
          },
          { key: "add", label: "Add stock", icon: <PackagePlus />, onSelect: () => openAdd(item) },
          {
            key: "deduct",
            label: "Deduct",
            icon: <PackageMinus />,
            disabled: item.on_hand === 0,
            onSelect: () => openDeduct(item),
          },
        ];

  const actionsFor = (item: IInventoryItem): IRowAction[] => [
    ...stockActionsFor(item),
    { key: "edit", label: "Edit", icon: <Pencil />, onSelect: () => openEdit(item) },
    item.archived_at
      ? { key: "restore", label: "Restore", icon: <ArchiveRestore />, onSelect: () => restore(item) }
      : { key: "archive", label: "Archive", icon: <Archive />, danger: true, onSelect: () => archive(item) },
  ];

  const itemColumn = column.display({
    id: "item",
    header: "Item",
    cell: ({ row }) => (
      <div className={itemCell}>
        <span className={itemName}>{row.original.name}</span>
        <span className={itemMeta}>{metaLine(row.original)}</span>
      </div>
    ),
  });

  const statusBadge = (item: IInventoryItem) => (
    <StatusBadge tone={stockStatusTones[item.stock_status]} dot>
      {stockStatusLabels[item.stock_status]}
    </StatusBadge>
  );

  const actionsColumn = column.display({
    id: "actions",
    header: () => <span className={visuallyHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <RowActionMenu label={row.original.name} actions={actionsFor(row.original)} />
      </div>
    ),
  });

  // A phone gets two columns: the item, and its stock with status underneath.
  const mobileColumns = [
    itemColumn,
    column.display({
      id: "stock",
      header: () => <span className={tableCellNumeric}>Stock</span>,
      cell: ({ row }) => (
        <div className={itemStockStack}>
          <span className={itemStockValue}>
            {row.original.on_hand} <span className={itemStockUnit}>{row.original.unit}</span>
          </span>
          {statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    itemColumn,
    column.display({
      id: "category",
      header: "Category",
      cell: ({ row }) => row.original.category_name ?? "—",
    }),
    column.display({
      id: "on_hand",
      header: () => <span className={tableCellNumeric}>On hand</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>
          <span className={itemStockValue}>{row.original.on_hand}</span>{" "}
          <span className={itemStockUnit}>{row.original.unit}</span>
        </div>
      ),
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
    column.display({
      id: "price",
      header: () => <span className={tableCellNumeric}>Price</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>
          {row.original.selling_price === null ? "—" : formatPeso(row.original.selling_price)}
        </div>
      ),
    }),
  ];

  const columns = [
    ...(isMobile ? mobileColumns : desktopColumns),
    ...(canManage ? [actionsColumn] : []),
  ];

  return (
    <DataTable
      tableKey={inventoryTableKey}
      label="Inventory items"
      data={items}
      columns={columns}
      getRowId={(item) => item.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={emptyText}
      loadingText="Loading inventory…"
      onRowClick={onOpen}
    />
  );
};

export default InventoryTable;
