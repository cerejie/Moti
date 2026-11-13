import { Minus, Plus, Trash2 } from "lucide-react";
import { useReceiveDeliveryForm } from "../../../hook/data/delivery/delivery.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IDeliveryFormInput } from "../../../models/data/delivery/delivery.request";
import { itemIdentity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  cartForm,
  cartList,
  cartRow,
  cartRowBottom,
  cartRowTop,
  cartSummary,
  cartSummaryMeta,
  cartSummaryTotal,
  quantityStepper,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatNumber } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import QuantityInput from "../../common/form/QuantityInput";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";

const formId = "receive-delivery-form";

const noteField: IFieldConfig<IDeliveryFormInput> = {
  name: "note",
  label: "Note",
  type: "textarea",
  span: "full",
  placeholder: "Optional, e.g. supplier or delivery receipt no.",
};

const DeliveryReviewModal = () => {
  const { open, delivery, form, mutation, onSubmit, onOpenChange } = useReceiveDeliveryForm();
  const empty = delivery.itemCount === 0;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review delivery"
      description="Check what arrived, then save it all at once."
      size="md"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={mutation.isPending}
            onPress={() => onOpenChange(false)}
          >
            Add more
          </AppButton>
          <AppButton type="submit" form={formId} loading={mutation.isPending} disabled={empty}>
            Save delivery
          </AppButton>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
        {mutation.error && <AppAlert tone="danger">{mutation.error.message}</AppAlert>}

        {empty ? (
          <EmptyState description="Nothing picked yet. Add the items that arrived from the list." />
        ) : (
          <ul className={cartList}>
            {delivery.lines.map(({ item, quantity }) => (
              <li key={item.id} className={cartRow}>
                <div className={cartRowTop}>
                  <span className={itemIdentity}>
                    <span className={itemName}>{item.name}</span>
                    <span className={itemMeta}>
                      {item.item_code} · {formatNumber(item.on_hand)} → {" "}
                      {formatNumber(item.on_hand + quantity)} {item.unit}
                    </span>
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
                <div className={cartRowBottom}>
                  <div className={quantityStepper}>
                    <AppButton
                      size="icon-lg"
                      variant="outline"
                      aria-label={`One less ${item.name}`}
                      disabled={quantity <= 1}
                      onPress={() => delivery.setQuantity(item.id, quantity - 1)}
                    >
                      <Minus />
                    </AppButton>
                    <QuantityInput
                      label={`Quantity of ${item.name} received`}
                      value={quantity}
                      min={1}
                      onChange={(next) => {
                        if (next !== null) delivery.setQuantity(item.id, next);
                      }}
                    />
                    <AppButton
                      size="icon-lg"
                      variant="outline"
                      aria-label={`One more ${item.name}`}
                      onPress={() => delivery.setQuantity(item.id, quantity + 1)}
                    >
                      <Plus />
                    </AppButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!empty && (
          <div className={cartSummary}>
            <span className={itemIdentity}>
              <span className={itemName}>Received</span>
              <span className={cartSummaryMeta}>{formatCount(delivery.itemCount, "item")}</span>
            </span>
            <span className={cartSummaryTotal}>{formatCount(delivery.totalQuantity, "pc")}</span>
          </div>
        )}

        <FormField config={noteField} />
      </FormRoot>
    </AppModal>
  );
};

export default DeliveryReviewModal;
