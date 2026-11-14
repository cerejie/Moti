import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import type { ICartItem } from "../../../models/data/transaction/transaction.request";
import QuantityInput from "../../common/form/QuantityInput";

type IProps = {
  item: ICartItem;
  quantity: number;
};

// The draft's quantity, typed, capped at what is available.
const CartQuantityInput = ({ item, quantity }: IProps) => {
  const { setQuantity } = useCart();

  return (
    <QuantityInput
      label={`Quantity of ${item.name}, in ${item.unit}`}
      value={quantity}
      min={1}
      max={item.on_hand}
      onChange={(next) => {
        if (next !== null) setQuantity(item.id, next);
      }}
    />
  );
};

export default CartQuantityInput;
