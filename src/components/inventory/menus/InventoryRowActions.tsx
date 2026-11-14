import {
  Archive,
  ArchiveRestore,
  ClipboardCheck,
  Eye,
  PackageMinus,
  PackagePlus,
  Pencil,
} from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useItemArchive } from "../../../hook/data/inventory/inventory.form.hook";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import { itemFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { itemPath } from "../../../utils/route.utils";
import RowActionMenu from "../../common/table/RowActionMenu";
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";

type IProps = {
  item: IInventoryItem;
};

// Sales go through Sell; here the owner opens a stock action with this item picked and manages it.
const InventoryRowActions = ({ item }: IProps) => {
  const { isOwner } = usePermissions();
  const stock = useStockActions();
  const formModal = useModal<IInventoryItem>(itemFormModalKey);
  const navigate = useTransitionNavigate();
  const { archive, restore } = useItemArchive();
  const archived = item.archived_at !== null;

  const actions: IRowAction[] = [];

  if (!archived && isOwner) {
    actions.push(
      {
        key: "receive",
        label: "Receive delivery",
        icon: <PackagePlus />,
        onSelect: () => stock.receive(item),
      },
      {
        key: "count",
        label: "Count stock",
        icon: <ClipboardCheck />,
        onSelect: () => stock.count(item),
      },
      {
        key: "damaged",
        label: "Damaged or lost",
        icon: <PackageMinus />,
        disabled: item.on_hand === 0,
        onSelect: () => stock.damaged(item),
      },
    );
  }
  actions.push({
    key: "details",
    label: "View details",
    icon: <Eye />,
    onSelect: () => void navigate(itemPath(item.id)),
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
