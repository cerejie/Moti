import { Bell, BellOff } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { usePushNotifications } from "../../../hook/common/push.hook";
import type { PushMode } from "../../../models/common/push.model";
import { accountCardBody, accountHint } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import StatusBadge from "../../common/status/StatusBadge";

const modeMessages: Record<PushMode, string> = {
  unconfigured: "Push notifications are not set up for this app yet.",
  unsupported: "This browser cannot receive push notifications.",
  "needs-install": "On iPhone and iPad, add Moti to your Home Screen first, then turn notifications on there.",
  blocked: "Notifications are blocked. Allow them for Moti in your browser or phone settings.",
  off: "Get a notification on this device when an item runs low or sells out, plus a stock check every morning at 8.",
  on: "This device gets low-stock and out-of-stock alerts, plus a stock check every morning at 8.",
};

// Owners only: employees have no alerts to receive.
const NotificationsCard = () => {
  const { receiveStockAlerts } = usePermissions();
  const { mode, enable, disable, enabling, disabling } = usePushNotifications();

  if (!receiveStockAlerts) return null;

  return (
    <SectionCard
      title="Low-stock notifications"
      actions={
        mode === "on" ? (
          <StatusBadge tone="success" dot>
            On
          </StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Off</StatusBadge>
        )
      }
    >
      <div className={accountCardBody}>
        <p className={accountHint}>{modeMessages[mode]}</p>
        {mode === "off" && (
          <AppButton loading={enabling} onPress={enable}>
            <Bell />
            Turn on notifications
          </AppButton>
        )}
        {mode === "on" && (
          <AppButton variant="outline" loading={disabling} onPress={disable}>
            <BellOff />
            Turn off on this device
          </AppButton>
        )}
      </div>
    </SectionCard>
  );
};

export default NotificationsCard;
