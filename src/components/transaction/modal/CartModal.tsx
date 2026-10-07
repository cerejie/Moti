import { Minus, Plus, Trash2 } from "lucide-react";
import { useCheckoutForm } from "../../../hook/data/transaction/transaction.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ICheckoutFormInput } from "../../../models/data/transaction/transaction.request";
import {
  itemIdentity,
  itemMeta,
  itemName,
  mutedText,
} from "../../../styles/inventory/inventory.styles";
import {
  cartForm,
  cartLineTotal,
  cartList,
  cartRow,
  cartRowBottom,
  cartRowTop,
  cartSummary,
  cartSummaryMeta,
  cartSummaryNoPrice,
  cartSummaryTotal,
  quantityStepper,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatNumber, formatPeso } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";
import CartQuantityInput from "../menus/CartQuantityInput";

const formId = "checkout-form";

const noteField: IFieldConfig<ICheckoutFormInput> = {
  name: "note",
  label: "Note",
  type: "textarea",
  span: "full",
  placeholder: "Optional, e.g. customer name or receipt no.",
};

const CartModal = () => {
  const { open, cart, form, mutation, onSubmit, onOpenChange } = useCheckoutForm();
  const empty = cart.itemCount === 0;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review transaction"
      description="Check the items and quantities, then complete the transaction."
      size="md"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={mutation.isPending}
            onPress={() => onOpenChange(false)}
          >
            Keep adding
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={empty}
          >
            Complete transaction
          </AppButton>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
        {mutation.error && <AppAlert tone="danger">{mutation.error.message}</AppAlert>}

        {empty ? (
          <EmptyState description="The cart is empty. Add items from the list." />
        ) : (
          <ul className={cartList}>
            {cart.lines.map(({ item, quantity }) => (
              <li key={item.id} className={cartRow}>
                <div className={cartRowTop}>
                  <span className={itemIdentity}>
                    <span className={itemName}>{item.name}</span>
                    <span className={itemMeta}>
                      {item.item_code} · {formatNumber(item.on_hand)} {item.unit} left
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
                  <div className={quantityStepper}>
                    <AppButton
                      size="icon-lg"
                      variant="outline"
                      aria-label={`One less ${item.name}`}
                      disabled={quantity <= 1}
                      onPress={() => cart.setQuantity(item.id, quantity - 1)}
                    >
                      <Minus />
                    </AppButton>
                    <CartQuantityInput item={item} quantity={quantity} />
                    <AppButton
                      size="icon-lg"
                      variant="outline"
                      aria-label={`One more ${item.name}`}
                      disabled={quantity >= item.on_hand}
                      onPress={() => cart.setQuantity(item.id, quantity + 1)}
                    >
                      <Plus />
                    </AppButton>
                  </div>
                  <span className={item.selling_price === null ? mutedText : cartLineTotal}>
                    {item.selling_price === null
                      ? "No price"
                      : formatPeso(item.selling_price * quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!empty && (
          <div className={cartSummary}>
            <span className={itemIdentity}>
              <span className={itemName}>Total</span>
              <span className={cartSummaryMeta}>
                {formatCount(cart.totalQuantity, "pc")}
                {cart.hasUnpriced ? " · items without a price not counted" : ""}
              </span>
            </span>
            <span className={cart.totalAmount === null ? cartSummaryNoPrice : cartSummaryTotal}>
              {cart.totalAmount === null ? "No prices set" : formatPeso(cart.totalAmount)}
            </span>
          </div>
        )}

        <FormField config={noteField} />
      </FormRoot>
    </AppModal>
  );
};

export default CartModal;
