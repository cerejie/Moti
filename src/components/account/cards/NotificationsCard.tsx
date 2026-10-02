import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "../../../hook/common/push.hook";
import type { PushMode } from "../../../models/common/push.model";
import { accountCardBody, accountHint } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import StatusBadge from "../../common/status/StatusBadge";

const modeMessages: Record<Exclude<PushMode, "on" | "off">, string> = {
  unconfigured: "Push notifications are not set up for this app yet.",
  unsupported: "This browser cannot receive push notifications.",
  "needs-install": "On iPhone and iPad, add Moti to your Home Screen first, then turn notifications on there.",
  blocked: "Notifications are blocked. Allow them for Moti in your browser or phone settings.",
};

const NotificationsCard = () => {
  const { mode, summary, enable, disable, enabling, disabling } = usePushNotifications();
  const message = mode === "on" || mode === "off" ? summary : modeMessages[mode];

  return (
    <SectionCard
      title="Notifications"
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
        <p className={accountHint}>{message}</p>
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
