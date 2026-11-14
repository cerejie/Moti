import { useBranchForm } from "../../../hook/data/branch/branch.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IBranchFormInput } from "../../../models/data/branch/branch.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const fields: IFieldConfig<IBranchFormInput>[] = [
  {
    name: "name",
    label: "Branch name",
    type: "text",
    span: "full",
    required: true,
    placeholder: "e.g. Main, Downtown, Toril",
  },
];

const BranchFormModal = () => {
  const { open, isEdit, form, mutation, onSubmit, onOpenChange } = useBranchForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Rename branch" : "Add branch"}
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel={isEdit ? "Save" : "Add branch"}
      error={mutation.error?.message}
    />
  );
};

export default BranchFormModal;
