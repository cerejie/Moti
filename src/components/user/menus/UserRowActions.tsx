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
import { useModal } from "../../../hook/common/modal.hook";
import { useCreatableRoles, useUserActions } from "../../../hook/data/user/user.form.hook";
import { userPasswordModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IUser } from "../../../models/data/user/user.response";
import { selectUserId, useAccountStore } from "../../../store/data/account/account.store";
import RowActionMenu from "../../common/table/RowActionMenu";

type IProps = {
  user: IUser;
};

// Only accounts below the caller's role get actions; the RPCs and RLS check the same.
const UserRowActions = ({ user }: IProps) => {
  const roles = useCreatableRoles();
  const selfId = useAccountStore(selectUserId);
  const actions = useUserActions();
  const passwordModal = useModal<IUser>(userPasswordModalKey);

  if (user.id === selfId || !roles.includes(user.role)) return null;

  const items: IRowAction[] = [];

  // Setting a temporary password answers the request; the database clears the flag.
  if (user.password_reset_requested_at) {
    items.push(
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
        onSelect: () => actions.dismissReset(user),
      },
    );
  }

  if (user.approval_status === "pending") {
    items.push(
      { key: "approve", label: "Approve", icon: <Check />, onSelect: () => actions.approve(user) },
      { key: "reject", label: "Reject", icon: <Ban />, onSelect: () => actions.reject(user) },
    );
  } else if (user.approval_status === "approved") {
    items.push(
      {
        key: "password",
        label: "Set password",
        icon: <KeyRound />,
        onSelect: () => passwordModal.openModal(user),
      },
      { key: "disable", label: "Disable", icon: <UserX />, onSelect: () => actions.disable(user) },
    );
  } else {
    items.push({
      key: "enable",
      label: "Turn back on",
      icon: <UserCheck />,
      onSelect: () => actions.enable(user),
    });
  }

  items.push({
    key: "delete",
    label: "Delete",
    icon: <Trash2 />,
    danger: true,
    onSelect: () => actions.remove(user),
  });

  return <RowActionMenu label={user.full_name} actions={items} />;
};

export default UserRowActions;
