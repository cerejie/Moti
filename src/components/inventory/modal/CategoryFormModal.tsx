import EntityFormModal from "../../common/form/EntityFormModal";
import { useCategoryForm } from "../../../hook/data/category/category.form.hook";
import type { ICategoryRequest } from "../../../models/data/category/category.request";

const CategoryFormModal = () => {
  const { form, onSubmit, open, isEditing, onOpenChange, errorText, isPending } =
    useCategoryForm();

  return (
    <EntityFormModal<ICategoryRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Rename category" : "Add category"}
      size="sm"
      form={form}
      fields={[
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Brakes" },
      ]}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : "Add category"}
      error={errorText}
    />
  );
};

export default CategoryFormModal;
