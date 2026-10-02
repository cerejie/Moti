import { Bell, BellRing } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useInboxList } from "../../../hook/data/inbox/inbox.list.hook";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { notificationCenterModalKey } from "../../../keys/modal.keys";
import { countBadge, countBadgeHost } from "../../../styles/status/badge.styles";
import AppButton from "../../common/button/AppButton";
import NotificationCenterModal from "../modal/NotificationCenterModal";

const badgeCap = 99;

// Every role: unread and waiting notifications, plus the owner's live stock alerts.
const InboxBell = () => {
  const { receiveStockAlerts } = usePermissions();
  const alerts = useStockAlerts(receiveStockAlerts);
  const { attentionCount } = useInboxList();
  const { openModal } = useModal(notificationCenterModalKey);

  const count = attentionCount + (receiveStockAlerts ? (alerts.data?.length ?? 0) : 0);
  const label = count === 0 ? "Notifications" : `Notifications, ${count} new`;

  return (
    <>
      <span className={countBadgeHost}>
        <AppButton variant="ghost" size="icon-lg" aria-label={label} onPress={() => openModal()}>
          {count > 0 ? <BellRing /> : <Bell />}
        </AppButton>
        {count > 0 && (
          <span className={countBadge} aria-hidden="true">
            {count > badgeCap ? `${badgeCap}+` : count}
          </span>
        )}
      </span>
      <NotificationCenterModal />
    </>
  );
};

export default InboxBell;
