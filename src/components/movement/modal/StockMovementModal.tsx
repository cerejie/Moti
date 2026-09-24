import EntityFormModal from "../../common/form/EntityFormModal";
import { useStockMovementForm } from "../../../hook/data/movement/movement.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IStockMovementRequest } from "../../../models/data/movement/movement.request";
import BalancePreview from "../cards/BalancePreview";

// Sale, add stock and deduct stock share this one form; the mode decides the reasons.
const StockMovementModal = () => {
  const {
    form,
    onSubmit,
    open,
    onOpenChange,
    item,
    mode,
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
      span: mode === "sale" ? "full" : "half",
      required: true,
      autoComplete: "off",
    },
    {
      name: "reason",
      label: "Reason",
      type: "select",
      required: true,
      options: reasonOptions,
      // A sale has one reason, so there is nothing to pick.
      hidden: (values) => values.mode === "sale",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      span: "full",
      placeholder: mode === "sale" ? "Optional, e.g. customer or receipt no." : "Optional",
    },
  ];

  return (
    <EntityFormModal<IStockMovementRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={item ? `${item.name} · SKU ${item.sku}` : undefined}
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
