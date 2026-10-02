import { useChangePasswordForm } from "../../../hook/account/account.settings.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IChangePasswordInput } from "../../../models/data/account/account.request";
import { accountForm, accountFormActions } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";

const fields: IFieldConfig<IChangePasswordInput>[] = [
  {
    name: "current_password",
    label: "Current password",
    type: "password",
    span: "full",
    autoComplete: "current-password",
  },
  {
    name: "password",
    label: "New password",
    type: "password",
    span: "full",
    autoComplete: "new-password",
  },
  {
    name: "confirm_password",
    label: "Confirm new password",
    type: "password",
    span: "full",
    autoComplete: "new-password",
  },
];

const ChangePasswordCard = () => {
  const { form, mutation, onSubmit } = useChangePasswordForm();

  return (
    <SectionCard title="Change password">
      <FormRoot form={form} onSubmit={onSubmit} className={accountForm}>
        {mutation.error && <AppAlert tone="danger">{mutation.error.message}</AppAlert>}

        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}

        <div className={accountFormActions}>
          <AppButton type="submit" loading={mutation.isPending}>
            Update password
          </AppButton>
        </div>
      </FormRoot>
    </SectionCard>
  );
};

export default ChangePasswordCard;
