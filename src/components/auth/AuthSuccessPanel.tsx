import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { authSubmit, authSuccess } from "../../styles/layout/auth.styles";
import AppButton from "../common/button/AppButton";
import StateBox from "../common/status/StateBox";

type IProps = {
  icon: ReactNode;
  title: string;
  message: string;
  onBack: () => void;
};

const AuthSuccessPanel = ({ icon, title, message, onBack }: IProps) => (
  <StateBox
    icon={icon}
    title={title}
    className={authSuccess}
    action={
      <AppButton className={authSubmit} onPress={onBack}>
        <ArrowLeft />
        Back to sign in
      </AppButton>
    }
  >
    {message}
  </StateBox>
);

export default AuthSuccessPanel;
