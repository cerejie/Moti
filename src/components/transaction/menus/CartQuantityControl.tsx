import { Minus, Plus } from "lucide-react";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  selectCartQuantity,
  useCartStore,
} from "../../../store/data/transaction/transaction.store";
import {
  addButton,
  quantityStepper,
  quantityValue,
} from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  item: IInventoryItem;
};

// "Add" until the item is in the cart, then − qty + capped at the stock left.
const CartQuantityControl = ({ item }: IProps) => {
  const { add, setQuantity, remove } = useCart();
  const quantity = useCartStore(selectCartQuantity(item.id));

  if (quantity === 0) {
    return (
      <AppButton
        size="lg"
        className={addButton}
        disabled={item.on_hand === 0}
        onPress={() => add(item)}
      >
        <Plus />
        {item.on_hand === 0 ? "Out of stock" : "Add"}
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
        disabled={quantity >= item.on_hand}
        onPress={() => add(item)}
      >
        <Plus />
      </AppButton>
    </div>
  );
};

export default CartQuantityControl;
