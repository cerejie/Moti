import { ClipboardCheck, PackageMinus, PackagePlus } from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { stockActionButton, stockActions } from "../../../styles/movement/movement.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  // On an item's page the same three open with that item already picked.
  item?: IInventoryItem;
  // While the item's count is still loading, so an action never starts from a stale number.
  disabled?: boolean;
};

// Where stock changes are made: what arrived, what is on the shelf, what is gone.
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
        Receive delivery
      </AppButton>
      <AppButton
        size="lg"
        variant="outline"
        className={stockActionButton}
        disabled={disabled}
        onPress={() => count(item)}
      >
        <ClipboardCheck data-icon="inline-start" aria-hidden />
        Count stock
      </AppButton>
      <AppButton
        size="lg"
        variant="outline"
        className={stockActionButton}
        disabled={disabled || item?.on_hand === 0}
        onPress={() => damaged(item)}
      >
        <PackageMinus data-icon="inline-start" aria-hidden />
        Damaged or lost
      </AppButton>
    </div>
  );
};

export default StockActions;
