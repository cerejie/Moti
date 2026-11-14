import { ClipboardCheck, History, PackageMinus, PackagePlus, Plus, Tags } from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";
import { itemFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { ROUTES } from "../../../routes/route.paths";
import AppButton from "../../common/button/AppButton";
import RowActionMenu from "../../common/table/RowActionMenu";

// One primary action for the screen; the occasional ones wait behind a labelled "More".
const InventoryHeaderActions = () => {
  const { manageInventory } = usePermissions();
  const formModal = useModal<IInventoryItem>(itemFormModalKey);
  const stock = useStockActions();
  const navigate = useTransitionNavigate();

  if (!manageInventory) return null;

  const more: IRowAction[] = [
    {
      key: "new-product",
      label: "New product",
      icon: <Plus />,
      onSelect: () => formModal.openModal(),
    },
    {
      key: "count",
      label: "Check stock count",
      icon: <ClipboardCheck />,
      onSelect: () => stock.count(),
    },
    {
      key: "damaged",
      label: "Record damaged or lost stock",
      icon: <PackageMinus />,
      onSelect: () => stock.damaged(),
    },
    {
      key: "history",
      label: "Stock history",
      icon: <History />,
      onSelect: () => void navigate(ROUTES.movements),
    },
    {
      key: "masterfile",
      label: "Categories & brands",
      icon: <Tags />,
      onSelect: () => void navigate(ROUTES.masterfile),
    },
  ];

  return (
    <>
      <AppButton size="lg" onPress={() => stock.receive()}>
        <PackagePlus data-icon="inline-start" aria-hidden />
        Add stock
      </AppButton>
      <RowActionMenu label="More stock actions" triggerLabel="More" actions={more} />
    </>
  );
};

export default InventoryHeaderActions;
