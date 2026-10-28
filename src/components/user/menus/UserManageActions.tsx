import {
  Ban,
  Check,
  KeyRound,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ApprovalStatus } from "../../../enums/role.enum";
import { useModal } from "../../../hook/common/modal.hook";
import { useUserActions } from "../../../hook/data/user/user.form.hook";
import { userPasswordModalKey } from "../../../keys/modal.keys";
import type { IUser } from "../../../models/data/user/user.response";
import { ROUTES } from "../../../routes/route.paths";
import {
  detailManageActions,
  detailManageButton,
  detailManageHint,
} from "../../../styles/view/detailPage.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  user: IUser;
};

const statusHints: Record<ApprovalStatus, string> = {
  pending: "Approving lets them sign in. Rejecting keeps them out until you turn the account on.",
  approved: "Disabling signs them out and keeps them out until you turn the account back on.",
  rejected: "Turning the account back on lets them sign in again.",
};

// The waiting request comes first in amber; the permanent Delete sits last and quieter.
const UserManageActions = ({ user }: IProps) => {
  const userActions = useUserActions();
  const passwordModal = useModal<IUser>(userPasswordModalKey);
  const navigate = useNavigate();
  const status = user.approval_status;

  return (
    <div className={detailManageActions}>
      {user.password_reset_requested_at && (
        <>
          <AppButton
            size="lg"
            variant="outline"
            tone="warningSoft"
            onPress={() => passwordModal.openModal(user)}
            className={detailManageButton}
          >
            <ShieldCheck data-icon="inline-start" aria-hidden />
            Set temporary password
          </AppButton>
          <AppButton
            size="lg"
            variant="outline"
            onPress={() => userActions.dismissReset(user)}
            className={detailManageButton}
          >
            <ShieldX data-icon="inline-start" aria-hidden />
            Dismiss reset request
          </AppButton>
        </>
      )}

      {status === "pending" && (
        <>
          <AppButton
            size="lg"
            variant="outline"
            tone="warningSoft"
            onPress={() => userActions.approve(user)}
            className={detailManageButton}
          >
            <Check data-icon="inline-start" aria-hidden />
            Approve
          </AppButton>
          <AppButton
            size="lg"
            variant="outline"
            onPress={() => userActions.reject(user)}
            className={detailManageButton}
          >
            <Ban data-icon="inline-start" aria-hidden />
            Reject
          </AppButton>
        </>
      )}

      {status === "approved" && (
        <>
          <AppButton
            size="lg"
            variant="outline"
            onPress={() => passwordModal.openModal(user)}
            className={detailManageButton}
          >
            <KeyRound data-icon="inline-start" aria-hidden />
            Set password
          </AppButton>
          <AppButton
            size="lg"
            variant="outline"
            onPress={() => userActions.disable(user)}
            className={detailManageButton}
          >
            <UserX data-icon="inline-start" aria-hidden />
            Disable account
          </AppButton>
        </>
      )}

      {status === "rejected" && (
        <AppButton
          size="lg"
          variant="outline"
          onPress={() => userActions.enable(user)}
          className={detailManageButton}
        >
          <UserCheck data-icon="inline-start" aria-hidden />
          Turn back on
        </AppButton>
      )}

      <AppButton
        size="lg"
        variant="outline"
        tone="dangerSoft"
        onPress={() => userActions.remove(user, () => void navigate(ROUTES.users, { replace: true }))}
        className={detailManageButton}
      >
        <Trash2 data-icon="inline-start" aria-hidden />
        Delete account
      </AppButton>

      <p className={detailManageHint}>{statusHints[status]}</p>
      <p className={detailManageHint}>Deleting removes the account for good. Stock history keeps their name.</p>
    </div>
  );
};

export default UserManageActions;
