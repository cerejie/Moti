import AuthShell from "../../components/auth/AuthShell";
import ForgotPasswordForm from "../../components/auth/forms/ForgotPasswordForm";

const ForgotPasswordView = () => (
  <AuthShell
    title="Forgot password"
    subtitle="Choose a new password. The owner approves it before it takes effect."
  >
    <ForgotPasswordForm />
  </AuthShell>
);

export default ForgotPasswordView;
