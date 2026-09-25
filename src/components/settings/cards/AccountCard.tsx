import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import FormField from "../../common/form/FormField";
import FormFieldGrid from "../../common/form/FormFieldGrid";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";
import { useChangePasswordForm } from "../../../hook/data/auth/auth.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IChangePasswordRequest } from "../../../models/data/auth/auth.request";
import {
  selectEmail,
  selectMustChangePassword,
  useAuthStore,
} from "../../../store/data/auth/auth.store";
import {
  settingsActions,
  settingsForm,
  settingsSubmit,
} from "../../../styles/settings/settings.styles";

const fields: IFieldConfig<IChangePasswordRequest>[] = [
  {
    name: "password",
    label: "New password",
    type: "password",
    required: true,
    autoComplete: "new-password",
    description: "At least 8 characters.",
  },
  {
    name: "confirm",
    label: "Confirm new password",
    type: "password",
    required: true,
    autoComplete: "new-password",
  },
];

const AccountCard = () => {
  const email = useAuthStore(selectEmail);
  const mustChange = useAuthStore(selectMustChangePassword);
  const { form, onSubmit, errorText, isPending } = useChangePasswordForm();

  return (
    <SectionCard title="Account" description={email ?? undefined}>
      <FormRoot form={form} onSubmit={onSubmit} className={settingsForm}>
        {mustChange && (
          <AppAlert tone="warning" title="You're using a temporary password">
            Choose your own password to finish setting up your account.
          </AppAlert>
        )}
        {errorText && <AppAlert tone="danger">{errorText}</AppAlert>}

        <FormFieldGrid>
          {fields.map((field) => (
            <FormField key={field.name} config={field} />
          ))}
        </FormFieldGrid>

        <div className={settingsActions}>
          <AppButton type="submit" loading={isPending} className={settingsSubmit}>
            Change password
          </AppButton>
        </div>
      </FormRoot>
    </SectionCard>
  );
};

export default AccountCard;
