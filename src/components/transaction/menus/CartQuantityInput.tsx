import { useEffect, useRef } from "react";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import type { ICartItem } from "../../../models/data/transaction/transaction.request";
import { clampQuantity } from "../../../store/data/transaction/transaction.store";
import { quantityInput } from "../../../styles/transaction/transaction.styles";
import TextInput from "../../common/form/TextInput";

type IProps = {
  item: ICartItem;
  quantity: number;
};

// The cart's quantity, typed: a counter sells small parts by the dozen.
const CartQuantityInput = ({ item, quantity }: IProps) => {
  const { setQuantity } = useCart();
  const input = useRef<HTMLInputElement>(null);

  // The − and + beside it change the quantity too; typing is never overwritten.
  useEffect(() => {
    const field = input.current;
    if (field && document.activeElement !== field) field.value = String(quantity);
  }, [quantity]);

  return (
    <TextInput
      ref={input}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      enterKeyHint="done"
      autoComplete="off"
      aria-label={`Quantity of ${item.name}`}
      className={quantityInput}
      defaultValue={quantity}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const typed = Number.parseInt(event.currentTarget.value, 10);
        if (typed >= 1) setQuantity(item.id, typed);
      }}
      onBlur={(event) => {
        const typed = Number.parseInt(event.currentTarget.value, 10);
        const next = clampQuantity(Number.isNaN(typed) ? 1 : typed, item.on_hand);
        setQuantity(item.id, next);
        event.currentTarget.value = String(next);
      }}
      onKeyDown={(event) => {
        // Enter here means "done typing", not "complete the transaction".
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
};

export default CartQuantityInput;
