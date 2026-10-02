import { ArrowRight } from "lucide-react";
import {
  movementReasonLabels,
  reasonsByType,
  stockActionTitles,
} from "../../../enums/stock.enum";
import { useStockMovementForm } from "../../../hook/data/movement/movement.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IMovementFormInput } from "../../../models/data/movement/movement.request";
import {
  itemIdentity,
  itemMeta,
  itemName,
  onHandUnit,
  onHandValue,
  stockForm,
  stockPreview,
  stockPreviewArrow,
  stockSummary,
} from "../../../styles/inventory/inventory.styles";
import { formatNumber } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import StockStatusBadge from "../status/StockStatusBadge";

const formId = "stock-movement-form";

const StockMovementModal = () => {
  const { open, item, action, form, mutation, preview, onSubmit, onOpenChange } =
    useStockMovementForm();

  if (!item) return null;

  const reasonOptions = reasonsByType[action].map((reason) => ({
    value: reason,
    label: movementReasonLabels[reason],
  }));

  const fields: IFieldConfig<IMovementFormInput>[] = [
    { name: "reason", label: "Reason", type: "select", options: reasonOptions, span: "full" },
    { name: "quantity", label: "Quantity", type: "number", span: "full", required: true },
    { name: "note", label: "Note", type: "textarea", span: "full", placeholder: "Optional" },
  ];

  const previewTone = preview.insufficient
    ? "danger"
    : preview.after <= item.reorder_level
      ? "warning"
      : "default";

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={stockActionTitles[action]}
      size="sm"
      footer={
        <>
          <AppButton variant="outline" disabled={mutation.isPending} onPress={() => onOpenChange(false)}>
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={preview.insufficient}
          >
            {stockActionTitles[action]}
          </AppButton>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={stockForm}>
        {mutation.error && <AppAlert tone="danger">{mutation.error.message}</AppAlert>}

        <div className={stockSummary}>
          <span className={itemIdentity}>
            <span className={itemName}>{item.name}</span>
            <span className={itemMeta}>{item.item_code}</span>
          </span>
          <StockStatusBadge status={item.stock_status} />
        </div>

        {fields
          .filter((field) => !field.hidden?.(form.getValues()))
          .map((field) => (
            <FormField key={field.name} config={field} />
          ))}

        <div className={stockPreview({ tone: previewTone })} aria-live="polite">
          <span>
            <span className={onHandValue({ status: item.stock_status })}>
              {formatNumber(preview.before)}
            </span>
            <span className={onHandUnit}>{item.unit}</span>
          </span>
          <ArrowRight className={stockPreviewArrow} aria-label="becomes" />
          <span>
            {formatNumber(Math.max(preview.after, 0))}
            <span className={onHandUnit}>{item.unit}</span>
          </span>
        </div>

        {preview.insufficient && (
          <AppAlert tone="danger">
            Only {formatNumber(preview.before)} {item.unit} on hand.
          </AppAlert>
        )}
      </FormRoot>
    </AppModal>
  );
};

export default StockMovementModal;
