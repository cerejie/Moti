import EntityFormModal from "../../common/form/EntityFormModal";
import { assignableRoles, userRoleLabels } from "../../../enums/role.enum";
import { useShopOptions } from "../../../hook/data/shop/shop.list.hook";
import { useUserForm } from "../../../hook/data/user/user.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IUserRequest } from "../../../models/data/user/user.request";

const UserFormModal = () => {
  const { form, onSubmit, open, isEditing, isSuperadmin, onOpenChange, errorText, isPending } =
    useUserForm();
  const { data: shops = [] } = useShopOptions();

  // Only the superadmin picks a role and shop; an owner's staff are employees of their shop.
  const placement: IFieldConfig<IUserRequest>[] =
    isSuperadmin && !isEditing
      ? [
          {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            options: assignableRoles(true).map((role) => ({ value: role, label: userRoleLabels[role] })),
          },
          {
            name: "shop_id",
            label: "Shop",
            type: "select",
            required: true,
            placeholder: "Choose a shop",
            options: shops.map((shop) => ({ value: shop.id, label: shop.name })),
          },
        ]
      : [];

  const fields: IFieldConfig<IUserRequest>[] = [
    { name: "full_name", label: "Full name", type: "text", span: "full", required: true, autoComplete: "off" },
    isEditing
      ? { name: "email", label: "Email", type: "readonly", span: "full", description: "An account's email can't be changed." }
      : {
          name: "email",
          label: "Email",
          type: "email",
          span: "full",
          required: true,
          autoComplete: "off",
          description: "They sign in with this email and a temporary password you'll see next.",
        },
    ...placement,
  ];

  return (
    <EntityFormModal<IUserRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit user" : isSuperadmin ? "Add user" : "Add employee"}
      size="md"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : "Create account"}
      error={errorText}
    />
  );
};

export default UserFormModal;
