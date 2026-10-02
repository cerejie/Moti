import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useUserCreateForm } from "../../../hook/data/user/user.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ICreateUserInput } from "../../../models/data/user/user.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const UserCreateModal = () => {
  const { open, roles, form, mutation, onSubmit, onOpenChange } = useUserCreateForm();

  const fields: IFieldConfig<ICreateUserInput>[] = [
    { name: "full_name", label: "Full name", type: "text", span: "full", required: true, autoComplete: "off" },
    { name: "email", label: "Email", type: "email", span: "full", required: true, autoComplete: "off" },
    {
      name: "role",
      label: "Role",
      type: "select",
      span: "full",
      options: roles.map((role) => ({ value: role, label: effectiveRoleLabels[role] })),
      // An owner only ever creates employees, so there is nothing to choose.
      hidden: () => roles.length < 2,
    },
    {
      name: "password",
      label: "Temporary password",
      type: "password",
      required: true,
      autoComplete: "new-password",
      description: "Share it with them; they can change it under My account.",
    },
    {
      name: "confirm_password",
      label: "Confirm password",
      type: "password",
      required: true,
      autoComplete: "new-password",
    },
  ];

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add account"
      description="The account is active right away; no approval needed."
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel="Create account"
      error={mutation.error?.message}
    />
  );
};

export default UserCreateModal;
