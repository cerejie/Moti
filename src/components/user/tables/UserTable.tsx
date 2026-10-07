import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useUserList } from "../../../hook/data/user/user.list.hook";
import type { ISegmentOption } from "../../../models/common/segment.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { UserView } from "../../../models/data/user/user.request";
import type { IUser } from "../../../models/data/user/user.response";
import { itemIdentity, itemMeta, itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatShortDate } from "../../../utils/format.utils";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import ContextSwitch from "../../common/view/ContextSwitch";
import UserRowActions from "../menus/UserRowActions";
import UserStatusBadges from "../status/UserStatusBadges";

const columns: IDataTableColumn<IUser>[] = [
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
    render: (_, user) => <UserRowActions user={user} />,
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
        columns={columns}
        data={query.data ?? []}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText={view === "pending" ? "No sign-ups waiting." : "No accounts here."}
      />
    </TablePanel>
  );
};

export default UserTable;
