import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import {
  successBadge,
  successBody,
  successText,
  successTitle,
} from "../../../styles/modal/success.styles";
import AppButton from "../button/AppButton";
import AppModal from "./AppModal";

type IProps = {
  modalKey: string;
  title: string;
  message: string;
  okText?: string;
  // Called when the user dismisses the prompt.
  onClose: () => void;
  // Extra detail under the message, such as the numbers a record was filed under.
  children?: ReactNode;
};

// Success prompt shown after a record is created.
const SuccessModal = ({
  modalKey,
  title,
  message,
  okText = "Done",
  onClose,
  children,
}: IProps) => {
  const { modal, closeModal } = useModal(modalKey);

  const close = () => {
    closeModal();
    onClose();
  };

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title={title}
      size="sm"
      hideHeader
      footer={
        <AppButton type="button" onClick={close}>
          {okText}
        </AppButton>
      }
    >
      <div className={successBody}>
        <span className={successBadge} aria-hidden>
          <Check size={36} strokeWidth={3} />
        </span>
        <p className={successTitle}>{title}</p>
        <p className={successText}>{message}</p>
        {children}
      </div>
    </AppModal>
  );
};

export default SuccessModal;
