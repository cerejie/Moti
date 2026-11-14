import { ShoppingCart } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import { cartModalKey } from "../../../keys/modal.keys";
import { reviewBar, reviewBarButton } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Phones only, and only once a product is picked: the one way forward is to review the sale.
const CartBar = () => {
  const { itemCount } = useCart();
  const { openModal } = useModal(cartModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={reviewBar}>
      <AppButton size="lg" className={reviewBarButton} onPress={() => openModal()}>
        <ShoppingCart data-icon="inline-start" aria-hidden />
        Review sale · {formatCount(itemCount, "product")}
      </AppButton>
    </div>
  );
};

export default CartBar;
