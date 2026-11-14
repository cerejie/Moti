import { useCheckoutForm } from "../../../hook/data/transaction/transaction.form.hook";
import {
  salePanel,
  salePanelActions,
  salePanelTitle,
} from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";
import SaleReviewForm from "../forms/SaleReviewForm";

const formId = "checkout-panel-form";

// Desktop: the draft sale stays beside the list and is the review itself, so Save sale is
// one click with everything already in view.
const SaleDraftPanel = () => {
  const checkout = useCheckoutForm();
  const { cart, mutation } = checkout;

  return (
    <section className={salePanel} aria-labelledby="sale-draft-title">
      <h2 id="sale-draft-title" className={salePanelTitle}>
        Review sale
      </h2>
      <SaleReviewForm formId={formId} checkout={checkout} />
      <div className={salePanelActions}>
        <AppButton
          size="lg"
          type="submit"
          form={formId}
          loading={mutation.isPending}
          disabled={cart.itemCount === 0 || mutation.isPending}
        >
          Save sale
        </AppButton>
      </div>
    </section>
  );
};

export default SaleDraftPanel;
