import { useVoidForm } from "../../../hook/data/transaction/transaction.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IVoidFormInput } from "../../../models/data/transaction/transaction.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const fields: IFieldConfig<IVoidFormInput>[] = [
  {
    name: "reason",
    label: "Reason",
    type: "textarea",
    span: "full",
    required: true,
    placeholder: "e.g. Customer returned the items",
  },
];

const VoidTransactionModal = () => {
  const { open, transaction, form, mutation, onSubmit, onOpenChange } = useVoidForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={transaction ? `Void transaction #${transaction.number}` : "Void transaction"}
      description="Every item goes back into stock. The transaction stays in history, marked voided."
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel="Void transaction"
      error={mutation.error?.message}
    />
  );
};

export default VoidTransactionModal;
