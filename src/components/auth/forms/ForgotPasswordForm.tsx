import { Lock, LockKeyhole, Mail, MailCheck } from "lucide-react";
import { useAccountForgotHook } from "../../../hook/account/account.forgot.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IForgotPasswordInput } from "../../../models/data/account/account.request";
import { ROUTES } from "../../../routes/route.paths";
import {
  authAlt,
  authAltLink,
  authForm,
  authSubmit,
} from "../../../styles/layout/auth.styles";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";
import AuthSuccessPanel from "../AuthSuccessPanel";

const fields: IFieldConfig<IForgotPasswordInput>[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@shop.com",
    icon: <Mail />,
    span: "full",
  },
  {
    name: "password",
    label: "New password",
    type: "password",
    placeholder: "At least 6 characters",
    icon: <Lock />,
    autoComplete: "new-password",
    span: "full",
  },
  {
    name: "confirm_password",
    label: "Confirm new password",
    type: "password",
    placeholder: "Type the password again",
    icon: <LockKeyhole />,
    autoComplete: "new-password",
    span: "full",
  },
];

const ForgotPasswordForm = () => {
  const { form, requested, resetMutation, onSubmit, backToSignIn } = useAccountForgotHook();

  if (requested) {
    return (
      <AuthSuccessPanel
        icon={<MailCheck />}
        title="Reset requested"
        message="The owner has been asked to approve your new password. Once approved, sign in with it. Until then your old password still works."
        onBack={backToSignIn}
      />
    );
  }

  return (
    <>
      <FormRoot form={form} onSubmit={onSubmit} className={authForm}>
        {resetMutation.error && (
          <AppAlert tone="danger">{resetMutation.error.message}</AppAlert>
        )}

        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}

        <AppButton type="submit" loading={resetMutation.isPending} className={authSubmit}>
          Request new password
        </AppButton>
      </FormRoot>

      <p className={authAlt}>
        Remembered it?
        <AppButton href={ROUTES.login} variant="link" className={authAltLink}>
          Sign in
        </AppButton>
      </p>
    </>
  );
};

export default ForgotPasswordForm;
