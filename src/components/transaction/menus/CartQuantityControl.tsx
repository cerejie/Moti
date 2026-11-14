import { Minus, Plus } from "lucide-react";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import type { ICartItem } from "../../../models/data/transaction/transaction.request";
import {
  selectCartQuantity,
  useCartStore,
} from "../../../store/data/transaction/transaction.store";
import { addButton, quantityStepper } from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";
import CartQuantityInput from "./CartQuantityInput";

type IProps = {
  // The list's branch; without one (the review) the product is already in the draft.
  branchId?: string;
  item: ICartItem;
};

// "Add" picks one into the draft (stock moves only on Save sale), then − qty + where the
// quantity can also be typed, so 20 never takes 19 taps. Capped at what is available.
const CartQuantityControl = ({ branchId, item }: IProps) => {
  const { add, setQuantity, remove } = useCart();
  const quantity = useCartStore(selectCartQuantity(item.id));

  if (quantity === 0) {
    if (!branchId) return null;
    return (
      <AppButton
        size="lg"
        className={addButton}
        disabled={item.on_hand === 0}
        aria-label={item.on_hand === 0 ? `${item.name} is out of stock` : `Add ${item.name}`}
        onPress={() => add(branchId, item)}
      >
        {item.on_hand === 0 ? (
          "Out of stock"
        ) : (
          <>
            <Plus data-icon="inline-start" aria-hidden />
            Add
          </>
        )}
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
      <CartQuantityInput item={item} quantity={quantity} />
      <AppButton
        size="icon-lg"
        variant="outline"
        aria-label={`One more ${item.name}`}
        disabled={quantity >= item.on_hand}
        onPress={() => setQuantity(item.id, quantity + 1)}
      >
        <Plus />
      </AppButton>
    </div>
  );
};

export default CartQuantityControl;
