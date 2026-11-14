import { Minus, Plus } from "lucide-react";
import { useDelivery } from "../../../hook/data/delivery/delivery.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  selectDeliveryQuantity,
  useDeliveryStore,
} from "../../../store/data/delivery/delivery.store";
import {
  addButton,
  quantityStepper,
  quantityValue,
} from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  branchId: string;
  item: IInventoryItem;
};

// "Add" until the item is on the delivery, then − qty +; the exact count is typed in the review.
const DeliveryQuantityControl = ({ branchId, item }: IProps) => {
  const { add, setQuantity, remove } = useDelivery();
  const quantity = useDeliveryStore(selectDeliveryQuantity(item.id));

  if (quantity === 0) {
    return (
      <AppButton size="lg" className={addButton} onPress={() => add(branchId, item)}>
        <Plus />
        Add
      </AppButton>
    );
  }

  return (
    <div className={quantityStepper}>
      <AppButton
        size="icon-lg"
        variant="outline"
        aria-label={quantity === 1 ? `Remove ${item.name}` : `One less ${item.name}`}
        onPress={() => (quantity === 1 ? remove(item.id) : setQuantity(item.id, quantity - 1))}
      >
        <Minus />
      </AppButton>
      <span className={quantityValue} aria-live="polite">
        {quantity}
      </span>
      <AppButton
        size="icon-lg"
        variant="outline"
        aria-label={`One more ${item.name}`}
        onPress={() => add(branchId, item)}
      >
        <Plus />
      </AppButton>
    </div>
  );
};

export default DeliveryQuantityControl;
