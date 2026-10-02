import { Lock, Mail } from "lucide-react";
import { useAccountLoginHook } from "../../../hook/account/account.login.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ILoginInput } from "../../../models/data/account/account.request";
import { ROUTES } from "../../../routes/route.paths";
import {
  authAlt,
  authAltLink,
  authForm,
  authHint,
  authMeta,
  authSubmit,
} from "../../../styles/layout/auth.styles";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";

const fields: IFieldConfig<ILoginInput>[] = [
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
    placeholder: "Enter your password",
    icon: <Lock />,
    autoComplete: "current-password",
    span: "full",
  },
];

const LoginForm = () => {
  const { form, loginMutation, onSubmit } = useAccountLoginHook();

  return (
    <>
      <FormRoot form={form} onSubmit={onSubmit} className={authForm}>
        {loginMutation.error && (
          <AppAlert tone="danger">{loginMutation.error.message}</AppAlert>
        )}

        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}

        <div className={authMeta}>
          <AppButton href={ROUTES.forgotPassword} variant="link" className={authHint}>
            Forgot password?
          </AppButton>
        </div>

        <AppButton type="submit" loading={loginMutation.isPending} className={authSubmit}>
          Sign in
        </AppButton>
      </FormRoot>

      <p className={authAlt}>
        New employee?
        <AppButton href={ROUTES.register} variant="link" className={authAltLink}>
          Create an account
        </AppButton>
      </p>
    </>
  );
};

export default LoginForm;
