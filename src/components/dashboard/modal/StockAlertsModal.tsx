import { LayoutDashboard } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import AppModal from "../../common/modal/AppModal";
import {
  useStockAlerts,
  useStockAlertsModal,
} from "../../../hook/data/dashboard/dashboard.list.hook";
import { alertsSheetNote } from "../../../styles/dashboard/dashboard.styles";
import StockAlertTable from "../tables/StockAlertTable";

// Opened from the topbar bell. Managers only.
const StockAlertsModal = () => {
  const { open, openModal, closeModal, openItem, openDashboard } = useStockAlertsModal();
  const { data, isLoading, isError, error, refetch, count, canView } = useStockAlerts();
  const shown = data?.data.length ?? 0;

  if (!canView) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={(next) => (next ? openModal() : closeModal())}
      title="Stock alerts"
      description="Items out of stock, at their reorder level, or close to it."
      size="md"
      footer={
        <>
          <AppButton variant="secondary" onPress={closeModal}>
            Close
          </AppButton>
          <AppButton onPress={openDashboard}>
            <LayoutDashboard />
            Open dashboard
          </AppButton>
        </>
      }
    >
      <StockAlertTable
        alerts={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        onOpen={openItem}
      />
      {count > shown && (
        <p className={alertsSheetNote}>
          Showing {shown} of {count}. The dashboard opens the full lists.
        </p>
      )}
    </AppModal>
  );
};

export default StockAlertsModal;
