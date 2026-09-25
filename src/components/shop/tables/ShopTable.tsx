import { Pause, Pencil, Play } from "lucide-react";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { shopStatusLabels, shopStatusOf, shopStatusTones } from "../../../enums/shop.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { useShopFormModal, useShopSuspension } from "../../../hook/data/shop/shop.form.hook";
import { shopTableKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IShop } from "../../../models/data/shop/shop.response";
import { formatCount, formatShortDate } from "../../../utils/format.utils";
import {
  tableCellActions,
  tableCellNumeric,
  tableHeadHidden,
} from "../../../styles/table/table.styles";
import {
  shopCell,
  shopMeta,
  shopName,
  shopStatusStack,
} from "../../../styles/shop/shop.styles";

type IProps = {
  shops: IShop[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  emptyText: string;
};

const column = dataTableColumns<IShop>();

const staffLine = (shop: IShop) =>
  `${formatCount(shop.staff_count)} ${shop.staff_count === 1 ? "user" : "users"}`;

const ShopTable = ({ shops, isLoading, isError, error, onRetry, emptyText }: IProps) => {
  const isMobile = useIsMobile();
  const { openRename } = useShopFormModal();
  const { suspend, reactivate } = useShopSuspension();

  const actionsFor = (shop: IShop): IRowAction[] => [
    { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openRename(shop) },
    shop.is_active
      ? { key: "suspend", label: "Suspend", icon: <Pause />, danger: true, onSelect: () => suspend(shop) }
      : { key: "reactivate", label: "Reactivate", icon: <Play />, onSelect: () => reactivate(shop) },
  ];

  const statusBadge = (shop: IShop) => {
    const status = shopStatusOf(shop.is_active);
    return (
      <StatusBadge tone={shopStatusTones[status]} dot>
        {shopStatusLabels[status]}
      </StatusBadge>
    );
  };

  const shopColumn = column.display({
    id: "shop",
    header: "Shop",
    cell: ({ row }) => (
      <div className={shopCell}>
        <span className={shopName}>{row.original.name}</span>
        {isMobile && <span className={shopMeta}>{staffLine(row.original)}</span>}
      </div>
    ),
  });

  const mobileColumns = [
    shopColumn,
    column.display({
      id: "status",
      header: () => <span className={tableCellNumeric}>Status</span>,
      cell: ({ row }) => <div className={shopStatusStack}>{statusBadge(row.original)}</div>,
    }),
  ];

  const desktopColumns = [
    shopColumn,
    column.display({
      id: "staff",
      header: () => <span className={tableCellNumeric}>Users</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>{formatCount(row.original.staff_count)}</div>
      ),
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
    column.display({
      id: "created",
      header: "Added",
      cell: ({ row }) => formatShortDate(row.original.created_at),
    }),
  ];

  const actionsColumn = column.display({
    id: "actions",
    header: () => <span className={tableHeadHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <RowActionMenu label={row.original.name} actions={actionsFor(row.original)} />
      </div>
    ),
  });

  return (
    <DataTable
      tableKey={shopTableKey}
      label="Shops"
      data={shops}
      columns={[...(isMobile ? mobileColumns : desktopColumns), actionsColumn]}
      getRowId={(shop) => shop.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={emptyText}
      loadingText="Loading shops…"
    />
  );
};

export default ShopTable;
