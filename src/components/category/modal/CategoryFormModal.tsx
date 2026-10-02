import { useCategoryForm } from "../../../hook/data/category/category.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ICategoryFormInput } from "../../../models/data/category/category.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const fields: IFieldConfig<ICategoryFormInput>[] = [
  {
    name: "name",
    label: "Category name",
    type: "text",
    span: "full",
    required: true,
    placeholder: "e.g. Brakes, Engine oil, Tires",
  },
];

const CategoryFormModal = () => {
  const { open, isEdit, form, mutation, onSubmit, onOpenChange } = useCategoryForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Rename category" : "Add category"}
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel={isEdit ? "Save" : "Add category"}
      error={mutation.error?.message}
    />
  );
};

export default CategoryFormModal;
