import { KeyRound, Pencil, UserCheck, UserX } from "lucide-react";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { userRoleLabels } from "../../../enums/role.enum";
import { userStatusLabels, userStatusOf, userStatusTones } from "../../../enums/user.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import {
  useResetPassword,
  useUserActivation,
  useUserFormModal,
} from "../../../hook/data/user/user.form.hook";
import { userTableKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IStaffUser } from "../../../models/data/user/user.response";
import {
  tableCellActions,
  tableCellNumeric,
  tableHeadHidden,
} from "../../../styles/table/table.styles";
import {
  userBadgeStack,
  userCell,
  userMeta,
  userName,
} from "../../../styles/user/user.styles";

type IProps = {
  users: IStaffUser[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  meId: string | null;
  // The superadmin's list spans shops, so each row names its shop.
  showShop: boolean;
  canManage: (user: IStaffUser) => boolean;
  emptyText: string;
};

const column = dataTableColumns<IStaffUser>();

const UserTable = ({
  users,
  isLoading,
  isError,
  error,
  onRetry,
  meId,
  showShop,
  canManage,
  emptyText,
}: IProps) => {
  const isMobile = useIsMobile();
  const { openEdit } = useUserFormModal();
  const { deactivate, reactivate } = useUserActivation();
  const resetPassword = useResetPassword();

  const actionsFor = (user: IStaffUser): IRowAction[] => [
    { key: "edit", label: "Edit name", icon: <Pencil />, onSelect: () => openEdit(user) },
    { key: "reset", label: "Reset password", icon: <KeyRound />, onSelect: () => resetPassword(user) },
    user.is_active
      ? { key: "deactivate", label: "Deactivate", icon: <UserX />, danger: true, onSelect: () => deactivate(user) }
      : { key: "reactivate", label: "Reactivate", icon: <UserCheck />, onSelect: () => reactivate(user) },
  ];

  const metaLine = (user: IStaffUser) =>
    [user.email, showShop && isMobile ? user.shop?.name : null].filter(Boolean).join(" · ");

  const roleBadge = (user: IStaffUser) => (
    <StatusBadge tone={user.role === "employee" ? "neutral" : "brand"}>
      {userRoleLabels[user.role]}
    </StatusBadge>
  );

  const statusBadge = (user: IStaffUser) => {
    const status = userStatusOf(user.is_active);
    return (
      <StatusBadge tone={userStatusTones[status]} dot>
        {userStatusLabels[status]}
      </StatusBadge>
    );
  };

  const userColumn = column.display({
    id: "user",
    header: "User",
    cell: ({ row }) => (
      <div className={userCell}>
        <span className={userName}>
          {row.original.full_name}
          {row.original.id === meId && " (you)"}
        </span>
        <span className={userMeta}>{metaLine(row.original)}</span>
      </div>
    ),
  });

  const mobileColumns = [
    userColumn,
    column.display({
      id: "status",
      header: () => <span className={tableCellNumeric}>Role</span>,
      cell: ({ row }) => (
        <div className={userBadgeStack}>
          {roleBadge(row.original)}
          {!row.original.is_active && statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    userColumn,
    ...(showShop
      ? [
          column.display({
            id: "shop",
            header: "Shop",
            cell: ({ row }) => row.original.shop?.name ?? "All shops",
          }),
        ]
      : []),
    column.display({
      id: "role",
      header: "Role",
      cell: ({ row }) => roleBadge(row.original),
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
  ];

  // Every row keeps the column so the grid stays aligned; rows you can't manage have no menu.
  const actionsColumn = column.display({
    id: "actions",
    header: () => <span className={tableHeadHidden}>Actions</span>,
    cell: ({ row }) => (
      <div className={tableCellActions}>
        {canManage(row.original) && (
          <RowActionMenu label={row.original.full_name} actions={actionsFor(row.original)} />
        )}
      </div>
    ),
  });

  return (
    <DataTable
      tableKey={userTableKey}
      label="Users"
      data={users}
      columns={[...(isMobile ? mobileColumns : desktopColumns), actionsColumn]}
      getRowId={(user) => user.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={emptyText}
      loadingText="Loading users…"
    />
  );
};

export default UserTable;
