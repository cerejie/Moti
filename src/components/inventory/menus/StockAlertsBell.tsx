import { Bell, BellRing } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { stockAlertsModalKey } from "../../../keys/modal.keys";
import { countBadge, countBadgeHost } from "../../../styles/status/badge.styles";
import AppButton from "../../common/button/AppButton";
import StockAlertsModal from "../modal/StockAlertsModal";

// The cap matches the alerts query limit.
const badgeCap = 50;

// Owner-only: the live count of low and out-of-stock items. It is computed from
// current stock, so it clears by itself once items are restocked.
const StockAlertsBell = () => {
  const { receiveStockAlerts } = usePermissions();
  const alerts = useStockAlerts(receiveStockAlerts);
  const { openModal } = useModal(stockAlertsModalKey);

  if (!receiveStockAlerts) return null;

  const count = alerts.data?.length ?? 0;
  const label =
    count === 0 ? "Stock alerts" : `Stock alerts, ${count} item${count === 1 ? "" : "s"} need restocking`;

  return (
    <>
      <span className={countBadgeHost}>
        <AppButton variant="ghost" size="icon-lg" aria-label={label} onPress={() => openModal()}>
          {count > 0 ? <BellRing /> : <Bell />}
        </AppButton>
        {count > 0 && (
          <span className={countBadge} aria-hidden="true">
            {count >= badgeCap ? `${badgeCap}+` : count}
          </span>
        )}
      </span>
      <StockAlertsModal />
    </>
  );
};

export default StockAlertsBell;
