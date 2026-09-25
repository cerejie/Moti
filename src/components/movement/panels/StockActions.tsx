import { PackageMinus, PackagePlus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { stockActionButton, stockActions } from "../../../styles/movement/movement.styles";

type IProps = {
  item: IInventoryItem;
};

// Managers add or deduct stock; selling happens on the Transaction screen. An archived item takes no stock.
const StockActions = ({ item }: IProps) => {
  const { adjustStock } = usePermissions();
  const { openAdd, openDeduct } = useStockMovementModal();

  if (item.archived_at || !adjustStock) return null;

  return (
    <div className={stockActions}>
      <AppButton
        variant="outline"
        size="lg"
        onPress={() => openAdd(item)}
        className={stockActionButton}
      >
        <PackagePlus />
        Add stock
      </AppButton>
      <AppButton
        variant="outline"
        size="lg"
        disabled={item.on_hand === 0}
        onPress={() => openDeduct(item)}
        className={stockActionButton}
      >
        <PackageMinus />
        Deduct
      </AppButton>
    </div>
  );
};

export default StockActions;
