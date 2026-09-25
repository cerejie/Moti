import { Store } from "lucide-react";
import FilterToolbar from "../../common/filter/FilterToolbar";
import StateBox from "../../common/status/StateBox";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { assignableRoles, userRoleLabels } from "../../../enums/role.enum";
import { userStatusLabels, type UserStatus } from "../../../enums/user.enum";
import { useShopOptions } from "../../../hook/data/shop/shop.list.hook";
import { useUserList } from "../../../hook/data/user/user.list.hook";
import { userTableKey } from "../../../keys/table.keys";
import type { IFilterControl } from "../../common/filter/FilterToolbar";
import UserTable from "../tables/UserTable";

const statusOptions = (Object.keys(userStatusLabels) as UserStatus[]).map((status) => ({
  value: status,
  label: userStatusLabels[status],
}));

const UsersPanel = () => {
  const { data, isLoading, isError, error, refetch, isSuperadmin, meId, canManage, hasShop } =
    useUserList();
  const { data: shops = [] } = useShopOptions();

  // An owner's list is fixed to their shop, so only the superadmin filters by shop and role.
  const controls: IFilterControl[] = [
    ...(isSuperadmin
      ? [
          {
            key: "shop_id",
            label: "Shop",
            placeholder: "All shops",
            options: shops.map((shop) => ({ value: shop.id, label: shop.name })),
          },
          {
            key: "role",
            label: "Role",
            placeholder: "All roles",
            options: assignableRoles(true).map((role) => ({ value: role, label: userRoleLabels[role] })),
          },
        ]
      : []),
    { key: "status", label: "Status", placeholder: "All statuses", options: statusOptions },
  ];

  if (!hasShop) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to see its users.
      </StateBox>
    );
  }

  return (
    <TablePanel
      toolbar={
        <FilterToolbar
          filterKey={userTableKey}
          searchKey={userTableKey}
          searchPlaceholder="Search name or email"
          controls={controls}
        />
      }
      footer={
        <TablePagination paginationKey={userTableKey} totalCount={data?.totalCount ?? 0} />
      }
    >
      <UserTable
        users={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        meId={meId}
        showShop={isSuperadmin}
        canManage={canManage}
        emptyText="No users match these filters."
      />
    </TablePanel>
  );
};

export default UsersPanel;
