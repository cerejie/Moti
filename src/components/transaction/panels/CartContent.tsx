import { ShoppingCart } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import { cartList } from "../../../styles/transaction/transaction.styles";
import CartLine from "../cards/CartLine";

// The cart's lines, shared by the desktop panel and the phone sheet.
const CartContent = () => {
  const { lines, setQuantity, removeLine } = useCart();

  if (lines.length === 0) {
    return (
      <StateBox icon={<ShoppingCart />} title="The cart is empty">
        Tap an item to add it.
      </StateBox>
    );
  }

  return (
    <ul className={cartList} aria-label="Cart items">
      {lines.map((line) => (
        <CartLine
          key={line.item_id}
          line={line}
          onQuantityChange={setQuantity}
          onRemove={removeLine}
        />
      ))}
    </ul>
  );
};

export default CartContent;
