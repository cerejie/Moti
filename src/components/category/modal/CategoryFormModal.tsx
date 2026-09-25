import EntityFormModal from "../../common/form/EntityFormModal";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryForm } from "../../../hook/data/category/category.form.hook";
import type { ICategoryRequest } from "../../../models/data/category/category.request";
import { toCodeInput } from "../../../utils/code.utils";

const CategoryFormModal = () => {
  const { form, onSubmit, open, isEditing, onOpenChange, errorText, isPending } =
    useCategoryForm();
  const { data: brands = [] } = useBrandOptions();

  return (
    <EntityFormModal<ICategoryRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit category" : "Add category"}
      size="sm"
      form={form}
      fields={[
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Brakes" },
        {
          name: "code",
          label: "Code",
          type: "text",
          span: "full",
          required: true,
          placeholder: "e.g. BRK",
          autoComplete: "off",
          mask: toCodeInput,
          description: isEditing
            ? "Starts every new item code in this category. Existing codes stay."
            : "Starts every item code in this category, e.g. BRK-UMI-001.",
        },
        {
          name: "brand_ids",
          label: "Brands",
          type: "multiselect",
          span: "full",
          placeholder: "Choose the brands it carries",
          options: brands.map((brand) => ({ value: brand.id, label: brand.name })),
          description: "New items in this category pick from these brands.",
        },
      ]}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : "Add category"}
      error={errorText}
    />
  );
};

export default CategoryFormModal;
