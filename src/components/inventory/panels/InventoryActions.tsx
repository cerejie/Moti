import { Plus, Tags } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useItemFormModal } from "../../../hook/data/inventory/inventory.form.hook";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import { categoryManagerModalKey } from "../../../keys/modal.keys";
import { inventoryActions } from "../../../styles/inventory/inventory.styles";

// Managers only, and only once there is a shop to write to.
const InventoryActions = () => {
  const { manageCatalog } = usePermissions();
  const { shopId } = useActiveShop();
  const { openCreate } = useItemFormModal();
  const { openModal: openCategories } = useModal(categoryManagerModalKey);

  if (!manageCatalog || !shopId) return null;

  return (
    <div className={inventoryActions}>
      <AppButton variant="outline" onPress={() => openCategories()}>
        <Tags />
        Categories
      </AppButton>
      <AppButton onPress={openCreate}>
        <Plus />
        Add item
      </AppButton>
    </div>
  );
};

export default InventoryActions;
