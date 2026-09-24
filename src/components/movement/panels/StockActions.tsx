import { PackageMinus, PackagePlus, ShoppingCart } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { stockActionButton, stockActions } from "../../../styles/movement/movement.styles";

type IProps = {
  item: IInventoryItem;
};

// Every member can sell; only managers add or deduct. An archived item takes no stock.
const StockActions = ({ item }: IProps) => {
  const { recordSale, adjustStock } = usePermissions();
  const { openSale, openAdd, openDeduct } = useStockMovementModal();

  if (item.archived_at || (!recordSale && !adjustStock)) return null;

  const empty = item.on_hand === 0;

  return (
    <div className={stockActions}>
      {recordSale && (
        <AppButton
          size="lg"
          disabled={empty}
          onPress={() => openSale(item)}
          className={stockActionButton}
        >
          <ShoppingCart />
          {empty ? "Out of stock" : "Sell"}
        </AppButton>
      )}
      {adjustStock && (
        <>
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
            disabled={empty}
            onPress={() => openDeduct(item)}
            className={stockActionButton}
          >
            <PackageMinus />
            Deduct
          </AppButton>
        </>
      )}
    </div>
  );
};

export default StockActions;
