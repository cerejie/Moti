import { PackageCheck, PackagePlus } from "lucide-react";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import { ROUTES } from "../../../routes/route.paths";
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
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";

const visibleRows = 6;

// Out-of-stock and low items, each one tap away from a restock.
const AttentionPanel = () => {
  const alerts = useStockAlerts();
  const stockModal = useStockMovementModal();
  const items = alerts.data ?? [];
  const count = items.length;

  const renderBody = () => {
    if (alerts.isLoading) return <StateBox loading>Checking stock…</StateBox>;
    if (alerts.isError) {
      return <ErrorState error={alerts.error} onRetry={() => void alerts.refetch()} />;
    }
    if (count === 0) {
      return (
        <StateBox icon={<PackageCheck />} title="All stocked up">
          Nothing is at or below its warning quantity.
        </StateBox>
      );
    }

    return (
      <ul className={dashboardList}>
        {items.slice(0, visibleRows).map((item) => (
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
              <AppButton
                size="icon"
                variant="outline"
                aria-label={`Add stock to ${item.name}`}
                onPress={() => stockModal.openModal({ item, action: "stock_in" })}
              >
                <PackagePlus />
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
      description={count > 0 ? `${count} item${count === 1 ? "" : "s"} to restock` : undefined}
      actions={
        count > visibleRows && (
          <AppButton href={ROUTES.inventory} variant="link">
            View all
          </AppButton>
        )
      }
    >
      {renderBody()}
    </SectionCard>
  );
};

export default AttentionPanel;
