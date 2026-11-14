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
    placeholder: "e.g. Customer returned the products",
  },
];

const VoidTransactionModal = () => {
  const { open, transaction, form, mutation, onSubmit, onOpenChange } = useVoidForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={transaction ? `Cancel sale #${transaction.number}?` : "Cancel sale?"}
      description="This restores the stock: every product goes back to the branch that sold it. The sale stays in history, marked cancelled, with your reason."
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel="Cancel sale"
      submitKind="danger"
      error={mutation.error?.message}
    />
  );
};

export default VoidTransactionModal;
