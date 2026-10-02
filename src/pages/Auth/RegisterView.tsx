import AuthShell from "../../components/auth/AuthShell";
import RegisterForm from "../../components/auth/forms/RegisterForm";

const RegisterView = () => (
  <AuthShell
    title="Create your account"
    subtitle="For shop employees. The owner approves new accounts before first sign-in."
  >
    <RegisterForm />
  </AuthShell>
);

export default RegisterView;
