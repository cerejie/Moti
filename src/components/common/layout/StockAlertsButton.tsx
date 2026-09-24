import { Bell } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import {
  useStockAlerts,
  useStockAlertsModal,
} from "../../../hook/data/dashboard/dashboard.list.hook";
import { toneSolid } from "../../../styles/common/tone.styles";
import {
  topbarAlertsButton,
  topbarAlertsCount,
} from "../../../styles/layout/topbar.styles";
import { formatBadgeCount } from "../../../utils/format.utils";
import AppButton from "../button/AppButton";

// Shown to managers while any item needs attention; clears itself once restocked.
const StockAlertsButton = () => {
  const { count, tone, canView } = useStockAlerts();
  const { openModal } = useStockAlertsModal();

  if (!canView || count === 0) return null;

  return (
    <AppButton
      variant="ghost"
      size="icon-lg"
      aria-label={`${count} ${count === 1 ? "item needs" : "items need"} attention`}
      onPress={openModal}
      className={topbarAlertsButton}
    >
      <Bell />
      <span className={cn(topbarAlertsCount, toneSolid({ tone }))} aria-hidden>
        {formatBadgeCount(count)}
      </span>
    </AppButton>
  );
};

export default StockAlertsButton;
