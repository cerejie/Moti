import { itemUnitLabels, itemUnitValues } from "../../../enums/unit.enum";
import { useItemForm } from "../../../hook/data/inventory/inventory.form.hook";
import type { IFieldSection } from "../../../models/common/field.model";
import type { IItemFormInput } from "../../../models/data/inventory/inventory.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const unitOptions = itemUnitValues.map((unit) => ({ value: unit, label: itemUnitLabels[unit] }));

const ItemFormModal = () => {
  const {
    open,
    isEdit,
    form,
    mutation,
    categoryOptions,
    brandOptions,
    askBranch,
    branchOptions,
    onSubmit,
    onOpenChange,
  } = useItemForm();

  const sections: IFieldSection<IItemFormInput>[] = [
    {
      key: "item",
      title: "Product",
      fields: [
        { name: "name", label: "Product name", type: "text", span: "full", required: true, placeholder: "e.g. Brake pad set, front" },
        {
          name: "category",
          label: "Category",
          type: "creatable",
          required: true,
          options: categoryOptions,
          placeholder: "Pick or type a new category",
        },
        {
          name: "brand",
          label: "Brand",
          type: "creatable",
          required: true,
          options: brandOptions,
          placeholder: "Pick or type a new brand",
        },
        { name: "unit", label: "Unit", type: "select", required: true, options: unitOptions },
        { name: "location", label: "Shelf / location", type: "text", placeholder: "Optional, e.g. Rack B-3" },
      ],
    },
    {
      key: "stock",
      title: "Stock",
      description: "Moti alerts you when a branch has this many or fewer left.",
      // The selling price has no field while prices are hidden; an edit carries the saved one through.
      fields: [
        {
          name: "branch_id",
          label: "Branch",
          type: "select",
          required: true,
          options: branchOptions,
          placeholder: "Pick a branch",
          description: "The branch that carries it and gets the opening stock.",
          hidden: () => !askBranch,
        },
        {
          name: "reorder_level",
          label: "Low-stock alert at",
          type: "number",
          required: true,
          description: "Notify me when this many or fewer remain, e.g. 5.",
        },
        {
          name: "opening_stock",
          label: "Opening stock",
          type: "number",
          description: "How many are available right now.",
          hidden: () => isEdit,
        },
      ],
    },
  ];

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit product" : "New product"}
      size="lg"
      form={form}
      sections={sections}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel={isEdit ? "Save changes" : "Save new product"}
      error={mutation.error?.message}
    />
  );
};

export default ItemFormModal;
