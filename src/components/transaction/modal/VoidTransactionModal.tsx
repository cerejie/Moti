import EntityFormModal from "../../common/form/EntityFormModal";
import { useVoidTransactionForm } from "../../../hook/data/transaction/transaction.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IVoidTransactionRequest } from "../../../models/data/transaction/transaction.request";
import { formatTransactionNo } from "../../../utils/format.utils";

const fields: IFieldConfig<IVoidTransactionRequest>[] = [
  {
    name: "reason",
    label: "Reason",
    type: "textarea",
    span: "full",
    required: true,
    placeholder: "e.g. Customer returned the items",
  },
];

// Owners only. Mounted after the detail modal, so it opens on top of it.
const VoidTransactionModal = () => {
  const { form, onSubmit, open, onOpenChange, transaction, errorText, isPending } =
    useVoidTransactionForm();

  return (
    <EntityFormModal<IVoidTransactionRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={
        transaction
          ? `Void transaction ${formatTransactionNo(transaction.transaction_no)}`
          : "Void transaction"
      }
      description="Every item on it comes back into stock. The transaction stays in the history as voided."
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel="Void transaction"
      error={errorText}
    />
  );
};

export default VoidTransactionModal;
