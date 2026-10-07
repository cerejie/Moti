import {
  Archive,
  ArchiveRestore,
  Eye,
  PackageMinus,
  PackagePlus,
  Pencil,
} from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useItemArchive } from "../../../hook/data/inventory/inventory.form.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import { itemDetailModalKey, itemFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import RowActionMenu from "../../common/table/RowActionMenu";

type IProps = {
  item: IInventoryItem;
};

// Sales go through Transaction; here the owner adjusts stock and manages the item.
const InventoryRowActions = ({ item }: IProps) => {
  const { isOwner } = usePermissions();
  const stockModal = useStockMovementModal();
  const formModal = useModal<IInventoryItem>(itemFormModalKey);
  const detailModal = useModal<IInventoryItem>(itemDetailModalKey);
  const { archive, restore } = useItemArchive();
  const archived = item.archived_at !== null;

  const actions: IRowAction[] = [];

  if (!archived && isOwner) {
    actions.push(
      {
        key: "stock-in",
        label: "Add stock",
        icon: <PackagePlus />,
        onSelect: () => stockModal.openModal({ item, action: "stock_in" }),
      },
      {
        key: "stock-out",
        label: "Deduct stock",
        icon: <PackageMinus />,
        disabled: item.on_hand === 0,
        onSelect: () => stockModal.openModal({ item, action: "stock_out" }),
      },
    );
  }
  actions.push({
    key: "details",
    label: "View details",
    icon: <Eye />,
    onSelect: () => detailModal.openModal(item),
  });
  if (isOwner) {
    actions.push(
      {
        key: "edit",
        label: "Edit item",
        icon: <Pencil />,
        onSelect: () => formModal.openModal(item),
      },
      archived
        ? {
            key: "restore",
            label: "Restore",
            icon: <ArchiveRestore />,
            onSelect: () => restore(item),
          }
        : {
            key: "archive",
            label: "Archive",
            icon: <Archive />,
            danger: true,
            onSelect: () => archive(item),
          },
    );
  }

  return <RowActionMenu label={`Manage ${item.name}`} actions={actions} />;
};

export default InventoryRowActions;
