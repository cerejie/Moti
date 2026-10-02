import { approvalStatusLabels, effectiveRoleLabels } from "../../../enums/role.enum";
import type { IUser } from "../../../models/data/user/user.response";
import { listRowNote } from "../../../styles/list/list.styles";
import ListRow from "../../common/list/ListRow";
import UserRowActions from "../menus/UserRowActions";

type IProps = {
  user: IUser;
};

// No account sheet exists, so the ⋮ menu stays on the row.
const UserRow = ({ user }: IProps) => (
  <ListRow
    title={user.full_name}
    subtitle={`${effectiveRoleLabels[user.role]} · ${user.email}`}
    trailing={
      <>
        <span className={listRowNote({ tone: user.approval_status === "pending" ? "warning" : "muted" })}>
          {approvalStatusLabels[user.approval_status]}
        </span>
        {user.password_reset_requested_at && (
          <span className={listRowNote({ tone: "info" })}>Reset asked</span>
        )}
      </>
    }
    action={<UserRowActions user={user} />}
  />
);

export default UserRow;
