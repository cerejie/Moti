import { Check } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import {
  useCart,
  useConfirmTransaction,
} from "../../../hook/data/transaction/transaction.form.hook";
import {
  cartConfirm,
  cartFooter,
  cartPanel,
} from "../../../styles/transaction/transaction.styles";
import CartTotal from "../cards/CartTotal";
import CartContent from "./CartContent";

// The cart beside the products, from md up. Phones use CartBar and CartSheetModal.
const CartPanel = () => {
  const { units, total } = useCart();
  const { confirm, canConfirm, isPending, errorText } = useConfirmTransaction();

  return (
    <SectionCard
      title="Cart"
      description={units === 1 ? "1 item" : `${units} items`}
      className={cartPanel}
      footer={
        <div className={cartFooter}>
          <CartTotal total={total} errorText={errorText} />
          <AppButton
            size="lg"
            className={cartConfirm}
            disabled={!canConfirm}
            loading={isPending}
            onPress={confirm}
          >
            <Check />
            Confirm
          </AppButton>
        </div>
      }
    >
      <CartContent />
    </SectionCard>
  );
};

export default CartPanel;
