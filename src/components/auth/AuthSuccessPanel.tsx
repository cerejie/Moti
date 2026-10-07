import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { authSubmit, authSuccess } from "../../styles/layout/auth.styles";
import AppButton from "../common/button/AppButton";
import EmptyState from "../common/status/EmptyState";

type IProps = {
  icon: ReactNode;
  title: string;
  message: string;
  onBack: () => void;
};

const AuthSuccessPanel = ({ icon, title, message, onBack }: IProps) => (
  <EmptyState
    icon={icon}
    title={title}
    description={message}
    className={authSuccess}
    action={
      <AppButton className={authSubmit} onPress={onBack}>
        <ArrowLeft />
        Back to sign in
      </AppButton>
    }
  />
);

export default AuthSuccessPanel;
