import { ArrowLeft } from "lucide-react";
import { backButton } from "../../../styles/button/button.styles";
import AppButton from "./AppButton";

type IProps = {
  label: string;
  onPress: () => void;
};

const BackButton = ({ label, onPress }: IProps) => (
  <AppButton
    variant="ghost"
    size="icon"
    aria-label={`Back to ${label}`}
    onPress={onPress}
    className={backButton}
  >
    <ArrowLeft />
  </AppButton>
);

export default BackButton;
