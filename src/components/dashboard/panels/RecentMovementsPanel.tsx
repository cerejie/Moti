import { History } from "lucide-react";
import { movementReasonLabels } from "../../../enums/stock.enum";
import { useRecentMovements } from "../../../hook/data/movement/movement.list.hook";
import { ROUTES } from "../../../routes/route.paths";
import {
  dashboardList,
  dashboardRow,
  dashboardRowText,
} from "../../../styles/dashboard/dashboard.styles";
import {
  historyQuantity,
  itemMeta,
  itemName,
} from "../../../styles/inventory/inventory.styles";
import { formatDateTime, formatSignedQuantity } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";

const RecentMovementsPanel = () => {
  const recent = useRecentMovements();
  const movements = recent.data ?? [];

  const renderBody = () => {
    if (recent.isLoading) return <StateBox loading>Loading activity…</StateBox>;
    if (recent.isError) {
      return <ErrorState error={recent.error} onRetry={() => void recent.refetch()} />;
    }
    if (movements.length === 0) {
      return (
        <StateBox icon={<History />} title="No activity yet">
          Sales and restocks show up here as they happen.
        </StateBox>
      );
    }

    return (
      <ul className={dashboardList}>
        {movements.map((movement) => (
          <li key={movement.id} className={dashboardRow}>
            <span className={dashboardRowText}>
              <span className={itemName}>{movement.item?.name ?? "Deleted item"}</span>
              <span className={itemMeta}>
                {[
                  movementReasonLabels[movement.reason],
                  movement.created_by_name,
                  formatDateTime(movement.created_at),
                ].join(" · ")}
              </span>
            </span>
            <span
              className={historyQuantity({ direction: movement.quantity > 0 ? "in" : "out" })}
            >
              {formatSignedQuantity(movement.quantity)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SectionCard
      title="Recent activity"
      actions={
        <AppButton href={ROUTES.movements} variant="link">
          Full history
        </AppButton>
      }
    >
      {renderBody()}
    </SectionCard>
  );
};

export default RecentMovementsPanel;
