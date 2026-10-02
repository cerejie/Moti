import { PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../hook/common/modal.hook";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { stockAlertsModalKey } from "../../../keys/modal.keys";
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
import AppModal from "../../common/modal/AppModal";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import StockStatusBadge from "../status/StockStatusBadge";

const StockAlertsModal = () => {
  const { modal, closeModal } = useModal(stockAlertsModalKey);
  const alerts = useStockAlerts();
  const navigate = useNavigate();
  const items = alerts.data ?? [];

  const goToDashboard = () => {
    closeModal();
    navigate(ROUTES.home);
  };

  const renderBody = () => {
    if (alerts.isLoading) return <StateBox loading>Checking stock…</StateBox>;
    if (alerts.isError) {
      return <ErrorState error={alerts.error} onRetry={() => void alerts.refetch()} />;
    }
    if (items.length === 0) {
      return (
        <StateBox icon={<PackageCheck />} title="All stocked up">
          No item is at or below its reorder level.
        </StateBox>
      );
    }

    return (
      <ul className={dashboardList}>
        {items.map((item) => (
          <li key={item.id} className={dashboardRow}>
            <span className={dashboardRowText}>
              <span className={itemName}>{item.name}</span>
              <span className={itemMeta}>
                {item.sku} · reorder at {formatNumber(item.reorder_level)}
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

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => !open && closeModal()}
      title="Stock alerts"
      description="Items at or below their reorder level. They clear once restocked."
      size="md"
      footer={
        <>
          <AppButton variant="outline" onPress={closeModal}>
            Close
          </AppButton>
          <AppButton onPress={goToDashboard}>Restock from dashboard</AppButton>
        </>
      }
    >
      {renderBody()}
    </AppModal>
  );
};

export default StockAlertsModal;
