import { approvalStatusLabels, approvalStatusTones } from "../../../enums/role.enum";
import type { IUser } from "../../../models/data/user/user.response";
import { userBadges } from "../../../styles/user/user.styles";
import StatusBadge from "../../common/status/StatusBadge";

type IProps = {
  user: IUser;
};

const UserStatusBadges = ({ user }: IProps) => (
  <span className={userBadges}>
    <StatusBadge tone={approvalStatusTones[user.approval_status]} dot>
      {approvalStatusLabels[user.approval_status]}
    </StatusBadge>
    {user.password_reset_requested_at && <StatusBadge tone="info">Password reset</StatusBadge>}
  </span>
);

export default UserStatusBadges;
