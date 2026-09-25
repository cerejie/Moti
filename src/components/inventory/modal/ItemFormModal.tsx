import EntityFormModal from "../../common/form/EntityFormModal";
import { useItemForm } from "../../../hook/data/inventory/inventory.form.hook";
import type { IFieldSection } from "../../../models/common/field.model";
import type { IItemRequest } from "../../../models/data/inventory/inventory.request";

const ItemFormModal = () => {
  const {
    form,
    onSubmit,
    open,
    isEditing,
    onOpenChange,
    errorText,
    isPending,
    categories,
    brands,
    units,
    locations,
    hasCategory,
    codeHint,
    addCategory,
    addBrand,
  } = useItemForm();

  const sections: IFieldSection<IItemRequest>[] = [
    {
      key: "item",
      title: "Item",
      fields: [
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Spark plug CPR8EA-9" },
        {
          name: "category_id",
          label: "Category",
          type: "select",
          required: true,
          placeholder: "Choose a category",
          options: categories.map((category) => ({ value: category.id, label: category.name })),
          selectAction: { label: "+ Add category", onSelect: addCategory },
        },
        {
          name: "brand_id",
          label: "Brand",
          type: "select",
          required: true,
          placeholder: hasCategory ? "Choose a brand" : "Choose a category first",
          disabled: !hasCategory,
          options: brands.map((brand) => ({ value: brand.id, label: brand.name })),
          selectAction: hasCategory ? { label: "+ Add brand", onSelect: addBrand } : undefined,
        },
        { name: "item_code", label: "Item code", type: "readonly", description: codeHint },
        { name: "part_number", label: "Part number", type: "text", autoComplete: "off" },
        { name: "fitment", label: "Fits", type: "text", span: "full", placeholder: "e.g. Honda Click 125i, Beat" },
      ],
    },
    {
      key: "stock",
      title: "Stock and price",
      fields: [
        {
          name: "unit_id",
          label: "Unit",
          type: "select",
          required: true,
          placeholder: "Choose a unit",
          options: units.map((unit) => ({ value: unit.id, label: unit.name })),
        },
        {
          name: "reorder_level",
          label: "Reorder level",
          type: "number",
          description: "Leave blank to use the shop default.",
        },
        { name: "selling_price", label: "Selling price", type: "amount", placeholder: "0.00" },
        {
          name: "location_id",
          label: "Location",
          type: "select",
          placeholder: "No location",
          allowClear: true,
          options: locations.map((location) => ({ value: location.id, label: location.name })),
        },
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
