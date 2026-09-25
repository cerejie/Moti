import { ShoppingCart } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import {
  useCart,
  useCartSheet,
} from "../../../hook/data/transaction/transaction.form.hook";
import { formatPeso } from "../../../utils/format.utils";
import {
  cartBar,
  cartBarButton,
  cartBarCount,
  cartBarRow,
  cartBarText,
  cartBarTotal,
} from "../../../styles/transaction/transaction.styles";

// Phones only: the cart's count and total, pinned above the tab bar.
const CartBar = () => {
  const { units, total } = useCart();
  const { openSheet } = useCartSheet();

  return (
    <div className={cartBar}>
      <div className={cartBarRow}>
        <div className={cartBarText}>
          <span className={cartBarCount}>{units === 1 ? "1 item" : `${units} items`}</span>
          <span className={cartBarTotal}>{formatPeso(total)}</span>
        </div>
        <AppButton size="lg" className={cartBarButton} onPress={openSheet}>
          <ShoppingCart />
          View cart
        </AppButton>
      </div>
    </div>
  );
};

export default CartBar;
