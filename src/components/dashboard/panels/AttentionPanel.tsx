import { PackageCheck, PackagePlus } from "lucide-react";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import { ROUTES } from "../../../routes/route.paths";
import {
  attentionAction,
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
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import EmptyState from "../../common/status/EmptyState";
import RowLink from "../../common/view/RowLink";

const visibleRows = 6;

// Out-of-stock and low items: a row opens the item, its button opens a delivery with it picked.
const AttentionPanel = () => {
  const alerts = useStockAlerts();
  const stock = useStockActions();
  const { writeBranch, multiple } = useActiveBranch();
  // "All branches": each row is one branch's shelf, so it says which, first so a long code cannot hide it.
  const acrossBranches = multiple && !writeBranch;
  const items = alerts.data ?? [];
  const count = items.length;

  const renderBody = () => {
    if (count === 0) {
      return <EmptyState compact icon={<PackageCheck aria-hidden />} title="All stocked up" />;
    }

    return (
      <ul className={dashboardList}>
        {items.slice(0, visibleRows).map((item) => (
          <li key={item.stock_id} className={dashboardRow}>
            <RowLink href={itemPath(item.id)} className={dashboardRowText}>
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
              <AppButton
                variant="outline"
                className={attentionAction}
                aria-label={`Receive a delivery of ${item.name}`}
                onPress={() => stock.receive(item)}
              >
                <PackagePlus data-icon="inline-start" aria-hidden />
                Receive
              </AppButton>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SectionCard
      title="Needs attention"
      subtitle={
        count > 0
          ? `${count} ${acrossBranches ? "low or out across branches" : `item${count === 1 ? "" : "s"} low or out`}`
          : undefined
      }
      extra={
        count > visibleRows && (
          <AppButton href={ROUTES.inventory} variant="link">
            View all
          </AppButton>
        )
      }
      loading={alerts.isLoading}
      error={alerts.error}
      onRetry={() => void alerts.refetch()}
    >
      {renderBody()}
    </SectionCard>
  );
};

export default AttentionPanel;
