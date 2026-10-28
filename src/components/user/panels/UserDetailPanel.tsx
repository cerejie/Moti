import { useParams } from "react-router-dom";
import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useCanManageUser } from "../../../hook/data/user/user.form.hook";
import { useUser } from "../../../hook/data/user/user.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IUser } from "../../../models/data/user/user.response";
import {
  detailPage,
  detailPageHeading,
  detailPageMeta,
  detailPageSurface,
  detailPageTitle,
} from "../../../styles/view/detailPage.styles";
import { formatDateTime, formatShortDate } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageSection from "../../common/view/DetailPageSection";
import UserManageActions from "../menus/UserManageActions";
import UserStatusBadges from "../status/UserStatusBadges";

const detailItems: IDetailItem<IUser>[] = [
  { key: "role", label: "Role", render: (user) => effectiveRoleLabels[user.role] },
  { key: "status", label: "Status", render: (user) => <UserStatusBadges user={user} /> },
  { key: "joined", label: "Joined", render: (user) => formatShortDate(user.created_at) },
  {
    key: "reset",
    label: "Reset asked",
    hidden: (user) => !user.password_reset_requested_at,
    render: (user) => formatDateTime(user.password_reset_requested_at),
  },
];

// Your own account and those at or above your role are read-only here, as in the list.
const UserDetailPanel = () => {
  const { userId } = useParams<{ userId: string }>();
  const query = useUser(userId);
  const canManage = useCanManageUser();
  const user = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading account…" />;
  if (!user) {
    return (
      <ErrorState error={query.error} title="Account not found" onRetry={() => void query.refetch()} />
    );
  }

  return (
    <div className={detailPage}>
      <div className={detailPageHeading}>
        <h1 className={detailPageTitle}>{user.full_name}</h1>
        <p className={detailPageMeta}>{user.email}</p>
      </div>

      <DetailPageSection title="Details">
        <div className={detailPageSurface}>
          <DetailRows record={user} items={detailItems} />
        </div>
      </DetailPageSection>

      {canManage(user) && (
        <DetailPageSection title="Manage">
          <UserManageActions user={user} />
        </DetailPageSection>
      )}
    </div>
  );
};

export default UserDetailPanel;
