import { ShoppingCart } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import { cartModalKey } from "../../../keys/modal.keys";
import { itemMeta } from "../../../styles/inventory/inventory.styles";
import {
  cartBar,
  cartBarText,
  cartBarTotal,
} from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Shows once something is picked; checkout happens in the cart review.
const CartBar = () => {
  const { itemCount, totalQuantity } = useCart();
  const { openModal } = useModal(cartModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={cartBar}>
      <span className={cartBarText}>
        <span className={cartBarTotal}>{formatCount(totalQuantity, "pc")}</span>
        <span className={itemMeta}>{formatCount(itemCount, "item")}</span>
      </span>
      <AppButton size="lg" onPress={() => openModal()}>
        <ShoppingCart />
        Review & checkout
      </AppButton>
    </div>
  );
};

export default CartBar;
