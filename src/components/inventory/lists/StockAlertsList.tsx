import { PackageCheck } from "lucide-react";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
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
import { itemPath } from "../../../utils/route.utils";
import ErrorState from "../../common/status/ErrorState";
import EmptyState from "../../common/status/EmptyState";
import RowLink from "../../common/view/RowLink";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  onOpen?: () => void;
};

// Computed from current stock, so an item leaves the list once it is restocked.
const StockAlertsList = ({ onOpen }: IProps) => {
  const alerts = useStockAlerts();
  const items = alerts.data ?? [];
  const { writeBranch, multiple } = useActiveBranch();
  // "All branches": each row is one branch's shelf, so it says which, first so a long code cannot hide it.
  const acrossBranches = multiple && !writeBranch;

  if (alerts.isLoading) return <EmptyState loading description="Checking stock…" />;
  if (alerts.isError) {
    return <ErrorState error={alerts.error} onRetry={() => void alerts.refetch()} />;
  }
  if (items.length === 0) {
    return <EmptyState compact icon={<PackageCheck aria-hidden />} title="All stocked up" />;
  }

  return (
    <ul className={dashboardList}>
      {items.map((item) => (
        <li key={item.stock_id} className={dashboardRow}>
          <RowLink href={itemPath(item.id)} onPress={onOpen} className={dashboardRowText}>
            <span className={itemName}>{item.name}</span>
            <span className={itemMeta}>
              {[
                acrossBranches && item.branch?.name,
                item.item_code,
                `warning at ${formatNumber(item.reorder_level)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </RowLink>
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
