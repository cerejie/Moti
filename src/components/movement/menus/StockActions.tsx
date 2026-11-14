import { ClipboardCheck, PackageMinus, PackagePlus } from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { stockActionButton, stockActions } from "../../../styles/movement/movement.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  // On a product's page the three open with that product already picked.
  item?: IInventoryItem;
  // While the item's count is still loading, so an action never starts from a stale number.
  disabled?: boolean;
};

// Add stock is the one primary action; the count and write-off are secondary.
const StockActions = ({ item, disabled = false }: IProps) => {
  const { isOwner } = usePermissions();
  const { receive, count, damaged } = useStockActions();

  if (!isOwner) return null;

  return (
    <div className={stockActions}>
      <AppButton
        size="lg"
        className={stockActionButton}
        disabled={disabled}
        onPress={() => receive(item)}
      >
        <PackagePlus data-icon="inline-start" aria-hidden />
        Add stock
      </AppButton>
      <AppButton
        size="lg"
        variant="outline"
        className={stockActionButton}
        disabled={disabled}
        onPress={() => count(item)}
      >
        <ClipboardCheck data-icon="inline-start" aria-hidden />
        Check stock count
      </AppButton>
      <AppButton
        size="lg"
        variant="outline"
        className={stockActionButton}
        disabled={disabled || item?.on_hand === 0}
        onPress={() => damaged(item)}
      >
        <PackageMinus data-icon="inline-start" aria-hidden />
        Record damaged or lost
      </AppButton>
    </div>
  );
};

export default StockActions;
