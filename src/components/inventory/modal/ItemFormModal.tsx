import EntityFormModal from "../../common/form/EntityFormModal";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { useItemForm } from "../../../hook/data/inventory/inventory.form.hook";
import type { IFieldSection } from "../../../models/common/field.model";
import type { IItemRequest } from "../../../models/data/inventory/inventory.request";

const ItemFormModal = () => {
  const { form, onSubmit, open, isEditing, onOpenChange, errorText, isPending } = useItemForm();
  const { data: categories = [] } = useCategoryOptions();

  const sections: IFieldSection<IItemRequest>[] = [
    {
      key: "item",
      title: "Item",
      fields: [
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Spark plug CPR8EA-9" },
        { name: "sku", label: "SKU", type: "text", required: true, autoComplete: "off" },
        {
          name: "category_id",
          label: "Category",
          type: "select",
          placeholder: "No category",
          options: categories.map((category) => ({ value: category.id, label: category.name })),
        },
        { name: "brand", label: "Brand", type: "text" },
        { name: "part_number", label: "Part number", type: "text", autoComplete: "off" },
        { name: "fitment", label: "Fits", type: "text", span: "full", placeholder: "e.g. Honda Click 125i, Beat" },
      ],
    },
    {
      key: "stock",
      title: "Stock and price",
      fields: [
        { name: "unit", label: "Unit", type: "text", required: true, placeholder: "pc, set, bottle" },
        {
          name: "reorder_level",
          label: "Reorder level",
          type: "number",
          description: "Leave blank to use the shop default.",
        },
        { name: "selling_price", label: "Selling price", type: "amount", placeholder: "0.00" },
        { name: "location", label: "Location", type: "text", placeholder: "e.g. Shelf A1" },
        // Stock only changes through movements, so it is set once, here.
        ...(isEditing
          ? []
          : [
              {
                name: "opening_quantity" as const,
                label: "Opening stock",
                type: "number" as const,
                description: "Recorded as the opening balance.",
              },
            ]),
      ],
    },
  ];

  return (
    <EntityFormModal<IItemRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit item" : "Add item"}
      size="lg"
      form={form}
      sections={sections}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save changes" : "Add item"}
      error={errorText}
    />
  );
};

export default ItemFormModal;
