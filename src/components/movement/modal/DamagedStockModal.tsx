import { ArrowRight } from "lucide-react";
import { useDamagedStockForm } from "../../../hook/data/movement/movement.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IDamagedFormInput } from "../../../models/data/movement/movement.request";
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
import StockStatusBadge from "../../inventory/status/StockStatusBadge";

const formId = "damaged-stock-form";

const fields: IFieldConfig<IDamagedFormInput>[] = [
  { name: "quantity", label: "Quantity", type: "number", span: "full", required: true },
  {
    name: "note",
    label: "Note",
    type: "textarea",
    span: "full",
    placeholder: "Optional, e.g. cracked in transit",
  },
];

const DamagedStockModal = () => {
  const { open, item, form, mutation, preview, onSubmit, onOpenChange } = useDamagedStockForm();

  if (!item) return null;

  const previewTone = preview.after <= item.reorder_level ? "warning" : "default";

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Damaged or lost"
      size="sm"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={mutation.isPending}
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={preview.insufficient || item.on_hand === 0}
          >
            Save
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

        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}

        {/* Past zero there is no "after" worth showing, only the shortfall. */}
        {preview.insufficient ? (
          <AppAlert tone="danger">
            Only {formatNumber(preview.before)} {item.unit} on hand —{" "}
            {formatNumber(-preview.after)} {item.unit} short.
          </AppAlert>
        ) : (
          <div className={stockPreview({ tone: previewTone })} aria-live="polite">
            <span>
              <span className={onHandValue({ status: item.stock_status })}>
                {formatNumber(preview.before)}
              </span>
              <span className={onHandUnit}>{item.unit}</span>
            </span>
            <ArrowRight className={stockPreviewArrow} aria-label="becomes" />
            <span>
              {formatNumber(preview.after)}
              <span className={onHandUnit}>{item.unit}</span>
            </span>
          </div>
        )}
      </FormRoot>
    </AppModal>
  );
};

export default DamagedStockModal;
