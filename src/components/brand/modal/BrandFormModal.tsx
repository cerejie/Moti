import { useBrandForm } from "../../../hook/data/brand/brand.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IBrandFormInput } from "../../../models/data/brand/brand.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const fields: IFieldConfig<IBrandFormInput>[] = [
  {
    name: "name",
    label: "Brand name",
    type: "text",
    span: "full",
    required: true,
    placeholder: "e.g. Yamaha, Honda, Motul",
  },
];

const BrandFormModal = () => {
  const { open, isEdit, form, mutation, onSubmit, onOpenChange } = useBrandForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Rename brand" : "Add brand"}
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel={isEdit ? "Save" : "Add brand"}
      error={mutation.error?.message}
    />
  );
};

export default BrandFormModal;
