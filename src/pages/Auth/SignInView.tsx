import SignInForm from "../../components/auth/forms/SignInForm";
import SectionCard from "../../components/common/card/SectionCard";

const SignInView = () => (
  <SectionCard
    title="Sign in"
    description="Use the email and password your shop gave you."
  >
    <SignInForm />
  </SectionCard>
);

export default SignInView;
