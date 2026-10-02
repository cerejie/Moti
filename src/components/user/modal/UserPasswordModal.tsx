import { useUserPasswordForm } from "../../../hook/data/user/user.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ISetPasswordInput } from "../../../models/data/user/user.request";
import EntityFormModal from "../../common/form/EntityFormModal";

const fields: IFieldConfig<ISetPasswordInput>[] = [
  {
    name: "password",
    label: "New password",
    type: "password",
    span: "full",
    required: true,
    autoComplete: "new-password",
  },
  {
    name: "confirm_password",
    label: "Confirm password",
    type: "password",
    span: "full",
    required: true,
    autoComplete: "new-password",
  },
];

const UserPasswordModal = () => {
  const { open, user, form, mutation, onSubmit, onOpenChange } = useUserPasswordForm();

  return (
    <EntityFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Set password"
      description={user ? `For ${user.full_name} (${user.email})` : undefined}
      size="sm"
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      submitting={mutation.isPending}
      submitLabel="Set password"
      error={mutation.error?.message}
    />
  );
};

export default UserPasswordModal;
