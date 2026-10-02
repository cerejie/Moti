import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useUserList } from "../../../hook/data/user/user.list.hook";
import { userTableKey } from "../../../keys/table.keys";
import type { UserView } from "../../../models/data/user/user.request";
import type { IUser } from "../../../models/data/user/user.response";
import { itemIdentity, itemMeta, itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { tableCellActions, tableHeadHidden } from "../../../styles/table/table.styles";
import { userCard, userCardTop, userViewTabs } from "../../../styles/user/user.styles";
import { formatShortDate } from "../../../utils/format.utils";
import SegmentedControl from "../../common/filter/SegmentedControl";
import DataTable from "../../common/table/DataTable";
import TablePanel from "../../common/table/TablePanel";
import { dataTableColumns, type IDataTableColumn } from "../../common/table/dataTable.config";
import UserRowActions from "../menus/UserRowActions";
import UserStatusBadges from "../status/UserStatusBadges";

const column = dataTableColumns<IUser>();

const columns: IDataTableColumn<IUser>[] = [
  column.display({
    id: "user",
    header: "Name",
    cell: ({ row }) => (
      <span className={itemIdentity}>
        <span className={itemName}>{row.original.full_name}</span>
        <span className={itemMeta}>{row.original.email}</span>
      </span>
    ),
  }),
  column.display({
    id: "role",
    header: "Role",
    cell: ({ row }) => <span className={mutedText}>{effectiveRoleLabels[row.original.role]}</span>,
  }),
  column.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <UserStatusBadges user={row.original} />,
  }),
  column.display({
    id: "joined",
    header: "Joined",
    cell: ({ row }) => <span className={mutedText}>{formatShortDate(row.original.created_at)}</span>,
  }),
  column.display({
    id: "actions",
    header: () => <span className={tableHeadHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        <UserRowActions user={row.original} />
      </div>
    ),
  }),
];

const viewOptions: { value: UserView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Active" },
  { value: "rejected", label: "Disabled" },
];

const UserCard = ({ user }: { user: IUser }) => (
  <article className={userCard}>
    <div className={userCardTop}>
      <span className={itemIdentity}>
        <span className={itemName}>{user.full_name}</span>
        <span className={itemMeta}>
          {effectiveRoleLabels[user.role]} · {user.email}
        </span>
      </span>
      <UserRowActions user={user} />
    </div>
    <UserStatusBadges user={user} />
  </article>
);

const UserTable = () => {
  const { query, view, setView } = useUserList();

  return (
    <TablePanel
      toolbar={
        <SegmentedControl
          label="Account status"
          value={view}
          onValueChange={(next) => setView(next as UserView)}
          options={viewOptions}
          className={userViewTabs}
        />
      }
    >
      <DataTable
        tableKey={userTableKey}
        label="Accounts"
        data={query.data ?? []}
        columns={columns}
        getRowId={(user) => user.id}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText={view === "pending" ? "No sign-ups waiting." : "No accounts here."}
        renderCard={(user) => <UserCard user={user} />}
      />
    </TablePanel>
  );
};

export default UserTable;
