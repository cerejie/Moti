import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormFieldGrid from "../../common/form/FormFieldGrid";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";
import { useSignInForm } from "../../../hook/data/auth/auth.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ISignInRequest } from "../../../models/data/auth/auth.request";
import {
  authForm,
  authHint,
  authSubmit,
} from "../../../styles/auth/auth.styles";

const fields: IFieldConfig<ISignInRequest>[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    span: "full",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    span: "full",
    placeholder: "Enter your password",
    autoComplete: "current-password",
  },
];

const SignInForm = () => {
  const { form, onSubmit, errorText, isPending } = useSignInForm();

  return (
    <FormRoot form={form} onSubmit={onSubmit} className={authForm}>
      {errorText && <AppAlert tone="danger">{errorText}</AppAlert>}

      <FormFieldGrid>
        {fields.map((field) => (
          <FormField key={field.name} config={field} />
        ))}
      </FormFieldGrid>

      <AppButton type="submit" size="lg" loading={isPending} className={authSubmit}>
        Sign in
      </AppButton>

      {/* Public sign-up is off; the shop owner creates and resets staff accounts. */}
      <p className={authHint}>Forgot your password? Ask your shop owner to reset it.</p>
    </FormRoot>
  );
};

export default SignInForm;
