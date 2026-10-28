import {
  Ban,
  Check,
  Eye,
  KeyRound,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../hook/common/modal.hook";
import { useCanManageUser, useUserActions } from "../../../hook/data/user/user.form.hook";
import { userPasswordModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IUser } from "../../../models/data/user/user.response";
import { userPath } from "../../../utils/route.utils";
import RowActionMenu from "../../common/table/RowActionMenu";

type IProps = {
  user: IUser;
};

const UserRowActions = ({ user }: IProps) => {
  const canManage = useCanManageUser();
  const userActions = useUserActions();
  const passwordModal = useModal<IUser>(userPasswordModalKey);
  const navigate = useNavigate();

  const details: IRowAction = {
    key: "details",
    label: "View details",
    icon: <Eye />,
    onSelect: () => void navigate(userPath(user.id)),
  };

  if (!canManage(user)) {
    return <RowActionMenu label={`Open ${user.full_name}`} actions={[details]} />;
  }

  const actions: IRowAction[] = [];

  // Setting a temporary password answers the request; the database clears the flag.
  if (user.password_reset_requested_at) {
    actions.push(
      {
        key: "reset-set",
        label: "Set temporary password",
        icon: <ShieldCheck />,
        onSelect: () => passwordModal.openModal(user),
      },
      {
        key: "reset-dismiss",
        label: "Dismiss request",
        icon: <ShieldX />,
        onSelect: () => userActions.dismissReset(user),
      },
    );
  }

  if (user.approval_status === "pending") {
    actions.push(
      { key: "approve", label: "Approve", icon: <Check />, onSelect: () => userActions.approve(user) },
      { key: "reject", label: "Reject", icon: <Ban />, onSelect: () => userActions.reject(user) },
    );
  } else if (user.approval_status === "approved") {
    actions.push(
      {
        key: "password",
        label: "Set password",
        icon: <KeyRound />,
        onSelect: () => passwordModal.openModal(user),
      },
      { key: "disable", label: "Disable", icon: <UserX />, onSelect: () => userActions.disable(user) },
    );
  } else {
    actions.push({
      key: "enable",
      label: "Turn back on",
      icon: <UserCheck />,
      onSelect: () => userActions.enable(user),
    });
  }

  // Disable is reversible and comes first; the permanent Delete waits at the end.
  actions.push(details, {
    key: "delete",
    label: "Delete",
    icon: <Trash2 />,
    danger: true,
    onSelect: () => userActions.remove(user),
  });

  return <RowActionMenu label={`Manage ${user.full_name}`} actions={actions} />;
};

export default UserRowActions;
