import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useCheckoutForm } from "../../../hook/data/transaction/transaction.form.hook";
import AppButton from "../../common/button/AppButton";
import AppModal from "../../common/modal/AppModal";
import SaleReviewForm from "../forms/SaleReviewForm";

const formId = "checkout-form";

// The phone's Review sale: a full-height screen. Back (or the system back) keeps the draft.
// Wide screens review in the side panel instead.
const CartModal = () => {
  const isCompact = useIsCompact();
  const checkout = useCheckoutForm();
  const { open, cart, mutation, onOpenChange } = checkout;

  if (!isCompact) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review sale"
      kind="flow"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={mutation.isPending}
            onPress={() => onOpenChange(false)}
          >
            Back to products
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={cart.itemCount === 0 || mutation.isPending}
          >
            Save sale
          </AppButton>
        </>
      }
    >
      <SaleReviewForm formId={formId} checkout={checkout} />
    </AppModal>
  );
};

export default CartModal;
