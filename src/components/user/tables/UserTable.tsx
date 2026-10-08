import {
  Ban,
  Check,
  KeyRound,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useModal } from "../../../hook/common/modal.hook";
import { useCreatableRoles, useUserActions } from "../../../hook/data/user/user.form.hook";
import { useUserList } from "../../../hook/data/user/user.list.hook";
import { userPasswordModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ISegmentOption } from "../../../models/common/segment.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { UserView } from "../../../models/data/user/user.request";
import type { IUser } from "../../../models/data/user/user.response";
import { selectUserId, useAccountStore } from "../../../store/data/account/account.store";
import { itemIdentity, itemMeta, itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import UserStatusBadges from "../status/UserStatusBadges";

const buildColumns = (actionsOf: (user: IUser) => IRowAction[]): IDataTableColumn<IUser>[] => [
  {
    key: "user",
    title: "Name",
    render: (_, user) => (
      <span className={itemIdentity}>
        <span className={itemName}>{user.full_name}</span>
        <span className={itemMeta}>{user.email}</span>
      </span>
    ),
  },
  {
    key: "role",
    title: "Role",
    render: (_, user) => <span className={mutedText}>{effectiveRoleLabels[user.role]}</span>,
    listRender: (user) => effectiveRoleLabels[user.role],
  },
  {
    key: "status",
    title: "Status",
    mobile: "status",
    render: (_, user) => <UserStatusBadges user={user} />,
  },
  {
    key: "joined",
    title: "Joined",
    listHidden: true,
    render: (_, user) => <span className={mutedText}>{formatShortDate(user.created_at)}</span>,
  },
  {
    key: "actions",
    title: "Action",
    align: "center",
    className: nowrapCell,
    render: (_, user) => {
      const actions = actionsOf(user);
      return actions.length > 0 ? (
        <RowActionMenu label={`Manage ${user.full_name}`} actions={actions} />
      ) : null;
    },
  },
];

const detailSections: IDetailSection<IUser>[] = [
  {
    key: "account",
    title: "Account",
    icon: <UserRound />,
    items: [
      { key: "email", label: "Email", span: 2, render: (user) => user.email },
      { key: "role", label: "Role", render: (user) => effectiveRoleLabels[user.role] },
      { key: "joined", label: "Joined", render: (user) => formatShortDate(user.created_at) },
      {
        key: "status",
        label: "Status",
        span: 2,
        render: (user) => <UserStatusBadges user={user} />,
      },
    ],
  },
];

const viewOptions: ISegmentOption<UserView>[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Active" },
  { key: "rejected", label: "Disabled" },
];

const UserTable = () => {
  const { query, view, setView } = useUserList();
  const roles = useCreatableRoles();
  const selfId = useAccountStore(selectUserId);
  const userActions = useUserActions();
  const passwordModal = useModal<IUser>(userPasswordModalKey);

  // Only accounts below the caller's role get actions; the RPCs and RLS check the same.
  // The row menu (wide) and the detail sheet footer (compact) share this list.
  const actionsOf = (user: IUser): IRowAction[] => {
    if (user.id === selfId || !roles.includes(user.role)) return [];

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
          onSelect: () => userActions.dismissReset(user),
        },
      );
    }

    if (user.approval_status === "pending") {
      items.push(
        { key: "approve", label: "Approve", icon: <Check />, onSelect: () => userActions.approve(user) },
        { key: "reject", label: "Reject", icon: <Ban />, onSelect: () => userActions.reject(user) },
      );
    } else if (user.approval_status === "approved") {
      items.push(
        {
          key: "password",
          label: "Set password",
          icon: <KeyRound />,
          onSelect: () => passwordModal.openModal(user),
        },
        { key: "disable", label: "Disable", icon: <UserX />, onSelect: () => userActions.disable(user) },
      );
    } else {
      items.push({
        key: "enable",
        label: "Turn back on",
        icon: <UserCheck />,
        onSelect: () => userActions.enable(user),
      });
    }

    items.push({
      key: "delete",
      label: "Delete",
      icon: <Trash2 />,
      danger: true,
      onSelect: () => userActions.remove(user),
    });

    return items;
  };

  return (
    <TablePanel
      toolbar={
        <ContextSwitch
          label="Account status"
          value={view}
          options={viewOptions}
          onChange={setView}
        />
      }
    >
      <DataTable<IUser>
        label="Accounts"
        columns={buildColumns(actionsOf)}
        data={query.data ?? []}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText={view === "pending" ? "No sign-ups waiting." : "No accounts here."}
        detailSections={detailSections}
        detailTitle={(user) => user.full_name}
        detailActions={actionsOf}
      />
    </TablePanel>
  );
};

export default UserTable;
