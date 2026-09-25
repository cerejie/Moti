import { Copy } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SuccessModal from "../../common/modal/SuccessModal";
import { useTemporaryPassword } from "../../../hook/data/user/user.form.hook";
import { temporaryPasswordModalKey } from "../../../keys/modal.keys";
import {
  passwordLabel,
  passwordNote,
  passwordPanel,
  passwordRow,
  passwordValue,
} from "../../../styles/user/user.styles";

// Shown once, after an account is created or a password reset; closing it forgets the password.
const TemporaryPasswordModal = () => {
  const { data, copy, clear } = useTemporaryPassword();

  return (
    <SuccessModal
      modalKey={temporaryPasswordModalKey}
      title="Temporary password"
      message={data ? `Give this to ${data.full_name} (${data.email}).` : ""}
      okText="I've saved it"
      onClose={clear}
    >
      {data && (
        <div className={passwordPanel}>
          <span className={passwordLabel}>Password</span>
          <div className={passwordRow}>
            <code className={passwordValue}>{data.temporary_password}</code>
            <AppButton
              variant="outline"
              size="icon-lg"
              aria-label="Copy password"
              onPress={() => void copy(data.temporary_password)}
            >
              <Copy />
            </AppButton>
          </div>
          <p className={passwordNote}>
            It won't be shown again. Moti asks them to change it after they sign in.
          </p>
        </div>
      )}
    </SuccessModal>
  );
};

export default TemporaryPasswordModal;
