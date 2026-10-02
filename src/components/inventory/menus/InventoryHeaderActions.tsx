import { Plus, Tags } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { itemFormModalKey } from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { ROUTES } from "../../../routes/route.paths";
import AppButton from "../../common/button/AppButton";

const InventoryHeaderActions = () => {
  const { manageInventory } = usePermissions();
  const formModal = useModal<IInventoryItem>(itemFormModalKey);

  if (!manageInventory) return null;

  return (
    <>
      <AppButton href={ROUTES.masterfile} variant="outline">
        <Tags />
        Masterfile
      </AppButton>
      <AppButton onPress={() => formModal.openModal()}>
        <Plus />
        Add item
      </AppButton>
    </>
  );
};

export default InventoryHeaderActions;
