import { Trash2 } from "lucide-react";
import type { useCheckoutForm } from "../../../hook/data/transaction/transaction.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ICheckoutFormInput } from "../../../models/data/transaction/transaction.request";
import { itemIdentity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  cartForm,
  cartList,
  cartRow,
  cartRowBottom,
  cartRowTop,
  cartSummary,
  cartSummaryCount,
  lineUnit,
  saleBranch,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatQuantity } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";
import DisclosureSection from "../../common/view/DisclosureSection";
import CartQuantityControl from "../menus/CartQuantityControl";

type IProps = {
  formId: string;
  checkout: ReturnType<typeof useCheckoutForm>;
};

const noteField: IFieldConfig<ICheckoutFormInput> = {
  name: "note",
  label: "Note",
  type: "textarea",
  span: "full",
  placeholder: "e.g. customer name or receipt no.",
};

// The draft sale: each product with its own unit, editable and removable, the branch, and an
// optional note kept folded. Shared by the phone's review sheet and the desktop panel.
const SaleReviewForm = ({ formId, checkout }: IProps) => {
  const { cart, branchName, form, mutation, onSubmit } = checkout;
  const empty = cart.itemCount === 0;

  return (
    <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
      {branchName && <p className={saleBranch}>Selling from {branchName}</p>}

      {mutation.error && (
        <AppAlert tone="danger" title="Not saved. Your products are still here.">
          {mutation.error.message}
        </AppAlert>
      )}

      {empty ? (
        <EmptyState description="No products yet. Tap Add beside a product to start a sale." />
      ) : (
        <ul className={cartList} aria-label="Products in this sale">
          {cart.lines.map(({ item, quantity }) => (
            <li key={item.id} className={cartRow}>
              <div className={cartRowTop}>
                <span className={itemIdentity}>
                  <span className={itemName} title={item.name}>
                    {item.name}
                  </span>
                  <span className={itemMeta}>
                    {item.item_code} · {formatQuantity(item.on_hand, item.unit)} available
                  </span>
                </span>
                <AppButton
                  size="icon-lg"
                  variant="ghost"
                  aria-label={`Remove ${item.name}`}
                  onPress={() => cart.remove(item.id)}
                >
                  <Trash2 />
                </AppButton>
              </div>
              <div className={cartRowBottom}>
                <CartQuantityControl item={item} />
                <span className={lineUnit}>
                  {formatQuantity(quantity, item.unit)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!empty && (
        <div className={cartSummary}>
          <span className={itemName}>In this sale</span>
          <span className={cartSummaryCount}>{formatCount(cart.itemCount, "product")}</span>
        </div>
      )}

      <DisclosureSection title="Add note (optional)">
        <FormField config={noteField} />
      </DisclosureSection>
    </FormRoot>
  );
};

export default SaleReviewForm;
