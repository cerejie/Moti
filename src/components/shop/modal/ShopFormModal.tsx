import EntityFormModal from "../../common/form/EntityFormModal";
import { useShopForm } from "../../../hook/data/shop/shop.form.hook";
import type { IShopRequest } from "../../../models/data/shop/shop.request";

const ShopFormModal = () => {
  const { form, onSubmit, open, isEditing, onOpenChange, errorText, isPending } = useShopForm();

  return (
    <EntityFormModal<IShopRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Rename shop" : "Add shop"}
      description={isEditing ? undefined : "Then add its owner from the Users screen."}
      size="sm"
      form={form}
      fields={[
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: "e.g. Demo Motor Parts" },
      ]}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : "Add shop"}
      error={errorText}
    />
  );
};

export default ShopFormModal;
