import EntityFormModal from "../../common/form/EntityFormModal";
import { useBrandForm } from "../../../hook/data/brand/brand.form.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import type { IBrandRequest } from "../../../models/data/brand/brand.request";
import { toCodeInput } from "../../../utils/code.utils";

const BrandFormModal = () => {
  const { form, onSubmit, open, isEditing, onOpenChange, errorText, isPending } =
    useBrandForm();
  const { data: categories = [] } = useCategoryOptions();

  return (
    <EntityFormModal<IBrandRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit brand" : "Add brand"}
      size="sm"
      form={form}
      fields={[
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Umma Iridium" },
        {
          name: "code",
          label: "Code",
          type: "text",
          span: "full",
          required: true,
          placeholder: "e.g. UMI",
          autoComplete: "off",
          mask: toCodeInput,
          description: isEditing
            ? "The middle of every new item code for this brand. Existing codes stay."
            : "The middle of its item codes, e.g. BRK-UMI-001.",
        },
        {
          name: "category_ids",
          label: "Sold in",
          type: "multiselect",
          span: "full",
          placeholder: "Choose categories",
          options: categories.map((category) => ({ value: category.id, label: category.name })),
          description: "Items in these categories can use this brand.",
        },
      ]}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : "Add brand"}
      error={errorText}
    />
  );
};

export default BrandFormModal;
