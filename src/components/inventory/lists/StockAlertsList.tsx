import { PackageCheck } from "lucide-react";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import {
  dashboardList,
  dashboardRow,
  dashboardRowEnd,
  dashboardRowText,
} from "../../../styles/dashboard/dashboard.styles";
import {
  itemMeta,
  itemName,
  onHandUnit,
  onHandValue,
} from "../../../styles/inventory/inventory.styles";
import { formatNumber } from "../../../utils/format.utils";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import StockStatusBadge from "../status/StockStatusBadge";

// Computed from current stock, so an item leaves the list once it is restocked.
const StockAlertsList = () => {
  const alerts = useStockAlerts();
  const items = alerts.data ?? [];

  if (alerts.isLoading) return <StateBox loading>Checking stock…</StateBox>;
  if (alerts.isError) {
    return <ErrorState error={alerts.error} onRetry={() => void alerts.refetch()} />;
  }
  if (items.length === 0) {
    return <StateBox compact icon={<PackageCheck aria-hidden />} title="All stocked up" />;
  }

  return (
    <ul className={dashboardList}>
      {items.map((item) => (
        <li key={item.id} className={dashboardRow}>
          <span className={dashboardRowText}>
            <span className={itemName}>{item.name}</span>
            <span className={itemMeta}>
              {item.item_code} · warning at {formatNumber(item.reorder_level)}
            </span>
          </span>
          <span className={dashboardRowEnd}>
            <span>
              <span className={onHandValue({ status: item.stock_status })}>
                {formatNumber(item.on_hand)}
              </span>
              <span className={onHandUnit}>{item.unit}</span>
            </span>
            <StockStatusBadge status={item.stock_status} />
          </span>
        </li>
      ))}
    </ul>
  );
};

export default StockAlertsList;
