import { Hourglass, Lock, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAccountRegisterHook } from "../../../hook/data/account/account.register.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IRegisterInput } from "../../../models/data/account/account.request";
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

const fields: IFieldConfig<IRegisterInput>[] = [
  {
    name: "full_name",
    label: "Full name",
    type: "text",
    placeholder: "Juan Dela Cruz",
    icon: <UserRound />,
    autoComplete: "name",
    span: "full",
  },
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
    label: "Password",
    type: "password",
    placeholder: "At least 6 characters",
    icon: <Lock />,
    autoComplete: "new-password",
    span: "full",
  },
  {
    name: "confirm_password",
    label: "Confirm password",
    type: "password",
    placeholder: "Type the password again",
    icon: <LockKeyhole />,
    autoComplete: "new-password",
    span: "full",
  },
];

const RegisterForm = () => {
  const { form, registered, registerMutation, onSubmit, backToSignIn } =
    useAccountRegisterHook();

  if (registered) {
    return (
      <AuthSuccessPanel
        icon={<Hourglass />}
        title="Waiting for approval"
        message="The owner reviews new sign-ups. You can sign in as soon as your account is approved."
        onBack={backToSignIn}
      />
    );
  }

  return (
    <>
      <FormRoot form={form} onSubmit={onSubmit} className={authForm}>
        {registerMutation.error && (
          <AppAlert tone="danger">{registerMutation.error.message}</AppAlert>
        )}

        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}

        <AppButton type="submit" loading={registerMutation.isPending} className={authSubmit}>
          Create account
        </AppButton>
      </FormRoot>

      <p className={authAlt}>
        Already have an account?
        <AppButton href={ROUTES.login} variant="link" className={authAltLink}>
          Sign in
        </AppButton>
      </p>
    </>
  );
};

export default RegisterForm;
