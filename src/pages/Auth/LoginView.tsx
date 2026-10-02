import AuthShell from "../../components/auth/AuthShell";
import LoginForm from "../../components/auth/forms/LoginForm";

const LoginView = () => (
  <AuthShell title="Welcome back" subtitle="Sign in to check stock and record sales.">
    <LoginForm />
  </AuthShell>
);

export default LoginView;
