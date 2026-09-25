import { Check } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import AppModal from "../../common/modal/AppModal";
import {
  useCart,
  useCartSheet,
  useConfirmTransaction,
} from "../../../hook/data/transaction/transaction.form.hook";
import { cartSheetBody } from "../../../styles/transaction/transaction.styles";
import CartTotal from "../cards/CartTotal";
import CartContent from "../panels/CartContent";

// The phone cart, opened from CartBar as a bottom sheet.
const CartSheetModal = () => {
  const { units, total } = useCart();
  const { open, onOpenChange, closeSheet } = useCartSheet();
  const { confirm, canConfirm, isPending, errorText } = useConfirmTransaction();

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Cart"
      description={units === 1 ? "1 item" : `${units} items`}
      size="md"
      footer={
        <>
          <AppButton variant="secondary" onPress={closeSheet}>
            Keep adding
          </AppButton>
          <AppButton disabled={!canConfirm} loading={isPending} onPress={confirm}>
            <Check />
            Confirm
          </AppButton>
        </>
      }
    >
      <div className={cartSheetBody}>
        <CartContent />
        <CartTotal total={total} errorText={errorText} />
      </div>
    </AppModal>
  );
};

export default CartSheetModal;
