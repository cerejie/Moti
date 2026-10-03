import AuthShell from "../../components/auth/AuthShell";
import ForgotPasswordForm from "../../components/auth/forms/ForgotPasswordForm";

const ForgotPasswordView = () => (
  <AuthShell
    title="Forgot password"
    subtitle="Enter your email. The owner sets a temporary password for you."
  >
    <ForgotPasswordForm />
  </AuthShell>
);

export default ForgotPasswordView;
