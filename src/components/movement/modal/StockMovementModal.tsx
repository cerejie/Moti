import EntityFormModal from "../../common/form/EntityFormModal";
import { useStockMovementForm } from "../../../hook/data/movement/movement.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IStockMovementRequest } from "../../../models/data/movement/movement.request";
import BalancePreview from "../cards/BalancePreview";

// Add stock and deduct stock share this one form; the mode decides the reasons.
const StockMovementModal = () => {
  const {
    form,
    onSubmit,
    open,
    onOpenChange,
    item,
    title,
    reasonOptions,
    preview,
    errorText,
    isPending,
  } = useStockMovementForm();

  const fields: IFieldConfig<IStockMovementRequest>[] = [
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      span: "half",
      required: true,
      autoComplete: "off",
    },
    {
      name: "reason",
      label: "Reason",
      type: "select",
      required: true,
      options: reasonOptions,
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      span: "full",
      placeholder: "Optional",
    },
  ];

  return (
    <EntityFormModal<IStockMovementRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={item ? `${item.name} · ${item.item_code}` : undefined}
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={title}
      error={errorText}
    >
      <BalancePreview before={preview.before} after={preview.after} unit={preview.unit} />
    </EntityFormModal>
  );
};

export default StockMovementModal;
