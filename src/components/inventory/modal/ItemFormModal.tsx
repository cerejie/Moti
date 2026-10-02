import { useItemForm } from "../../../hook/data/inventory/inventory.form.hook";
import type { IFieldSection } from "../../../models/common/field.model";
import type { IItemFormInput } from "../../../models/data/inventory/inventory.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const ItemFormModal = () => {
  const {
    open,
    isEdit,
    form,
    mutation,
    categoryOptions,
    brandOptions,
    onSubmit,
    onOpenChange,
  } = useItemForm();

  const sections: IFieldSection<IItemFormInput>[] = [
    {
      key: "item",
      title: "Item",
      fields: [
        { name: "name", label: "Item name", type: "text", span: "full", required: true, placeholder: "e.g. Brake pad set, front" },
        { name: "sku", label: "SKU", type: "text", required: true, placeholder: "e.g. BP-1023" },
        {
          name: "category",
          label: "Category",
          type: "creatable",
          options: categoryOptions,
          placeholder: "Pick or type a new category",
        },
        {
          name: "brand",
          label: "Brand",
          type: "creatable",
          options: brandOptions,
          placeholder: "Pick or type a new brand",
        },
        { name: "part_number", label: "Part number", type: "text" },
        { name: "unit", label: "Unit", type: "text", required: true, placeholder: "pc, set, L" },
        { name: "location", label: "Shelf / location", type: "text", placeholder: "e.g. Rack B-3" },
      ],
    },
    {
      key: "stock",
      title: "Stock and price",
      description: "You get a low-stock alert when on-hand drops to the reorder level.",
      fields: [
        { name: "reorder_level", label: "Reorder level", type: "number", required: true },
        { name: "selling_price", label: "Selling price", type: "amount", placeholder: "Optional" },
        {
          name: "opening_stock",
          label: "Opening stock",
          type: "number",
          description: "How many are on the shelf right now.",
          hidden: () => isEdit,
        },
      ],
    },
  ];

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit item" : "Add item"}
      size="lg"
      form={form}
      sections={sections}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel={isEdit ? "Save changes" : "Add item"}
      error={mutation.error?.message}
    />
  );
};

export default ItemFormModal;
