import { Trash2 } from "lucide-react";
import { useReceiveDeliveryForm } from "../../../hook/data/delivery/delivery.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IDeliveryFormInput } from "../../../models/data/delivery/delivery.request";
import { itemIdentity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  cartForm,
  cartList,
  cartRow,
  cartRowTop,
  cartSummary,
  cartSummaryCount,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatQuantity } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import QuantityInput from "../../common/form/QuantityInput";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";
import DisclosureSection from "../../common/view/DisclosureSection";
import StockMathRow from "../../inventory/cards/StockMathRow";

const formId = "receive-delivery-form";

const noteField: IFieldConfig<IDeliveryFormInput> = {
  name: "note",
  label: "Note",
  type: "textarea",
  span: "full",
  placeholder: "e.g. supplier or delivery receipt no.",
};

// Adds what arrived to what is available: every line shows the sum before it is saved.
const DeliveryReviewModal = () => {
  const { open, delivery, form, mutation, onSubmit, onOpenChange } = useReceiveDeliveryForm();
  const empty = delivery.itemCount === 0;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review added stock"
      description="Type how many arrived of each product, then save them all at once."
      size="md"
      kind="form"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={mutation.isPending}
            onPress={() => onOpenChange(false)}
          >
            Add more products
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={empty || mutation.isPending}
          >
            Save added stock
          </AppButton>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
        {mutation.error && (
          <AppAlert tone="danger" title="Not saved. Your list is still here.">
            {mutation.error.message}
          </AppAlert>
        )}

        {empty ? (
          <EmptyState description="Nothing picked yet. Add the products that arrived from the list." />
        ) : (
          <ul className={cartList} aria-label="Products received">
            {delivery.lines.map(({ item, quantity }) => (
              <li key={item.id} className={cartRow}>
                <div className={cartRowTop}>
                  <span className={itemIdentity}>
                    <span className={itemName} title={item.name}>
                      {item.name}
                    </span>
                    <span className={itemMeta}>{item.item_code}</span>
                  </span>
                  <AppButton
                    size="icon-lg"
                    variant="ghost"
                    aria-label={`Remove ${item.name}`}
                    onPress={() => delivery.remove(item.id)}
                  >
                    <Trash2 />
                  </AppButton>
                </div>
                <StockMathRow
                  cells={[
                    { label: "Available", content: formatQuantity(item.on_hand, item.unit) },
                    {
                      label: "Received",
                      content: (
                        <QuantityInput
                          label={`${item.name} received, in ${item.unit}`}
                          value={quantity}
                          min={1}
                          onChange={(next) => {
                            if (next !== null) delivery.setQuantity(item.id, next);
                          }}
                        />
                      ),
                    },
                    {
                      label: "After saving",
                      content: formatQuantity(item.on_hand + quantity, item.unit),
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}

        {!empty && (
          <div className={cartSummary}>
            <span className={itemName}>Adding stock to</span>
            <span className={cartSummaryCount}>{formatCount(delivery.itemCount, "product")}</span>
          </div>
        )}

        <DisclosureSection title="Add note (optional)">
          <FormField config={noteField} />
        </DisclosureSection>
      </FormRoot>
    </AppModal>
  );
};

export default DeliveryReviewModal;
