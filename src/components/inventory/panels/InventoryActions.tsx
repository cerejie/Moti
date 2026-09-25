import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useItemFormModal } from "../../../hook/data/inventory/inventory.form.hook";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import { inventoryActions } from "../../../styles/inventory/inventory.styles";

// Managers only, and only once there is a shop to write to. Categories, brands,
// units and locations live in Settings → Masterfile.
const InventoryActions = () => {
  const { manageCatalog } = usePermissions();
  const { shopId } = useActiveShop();
  const { openCreate } = useItemFormModal();

  if (!manageCatalog || !shopId) return null;

  return (
    <div className={inventoryActions}>
      <AppButton onPress={openCreate}>
        <Plus />
        Add item
      </AppButton>
    </div>
  );
};

export default InventoryActions;
