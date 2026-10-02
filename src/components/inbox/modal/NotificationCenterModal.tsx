import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useStockAlerts } from "../../../hook/data/inventory/inventory.list.hook";
import { notificationCenterModalKey } from "../../../keys/modal.keys";
import { ROUTES } from "../../../routes/route.paths";
import {
  inboxCenter,
  inboxSection,
  inboxSectionHeader,
  inboxSectionTitle,
} from "../../../styles/inbox/inbox.styles";
import PushPromptNotice from "../../account/cards/PushPromptNotice";
import AppButton from "../../common/button/AppButton";
import AppModal from "../../common/modal/AppModal";
import StockAlertsList from "../../inventory/lists/StockAlertsList";
import InboxFeed from "../lists/InboxFeed";

const NotificationCenterModal = () => {
  const { receiveStockAlerts } = usePermissions();
  const { modal, closeModal } = useModal(notificationCenterModalKey);
  const alerts = useStockAlerts(receiveStockAlerts);
  const hasAlerts = (alerts.data?.length ?? 0) > 0;
  const navigate = useNavigate();

  const goToDashboard = () => {
    closeModal();
    navigate(ROUTES.home);
  };

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => !open && closeModal()}
      title="Notifications"
      size="md"
      footer={
        <AppButton variant="outline" onPress={closeModal}>
          Close
        </AppButton>
      }
    >
      <div className={inboxCenter}>
        <PushPromptNotice />
        <InboxFeed section="action" onOpen={closeModal} />
        {receiveStockAlerts && (
          <section className={inboxSection}>
            <div className={inboxSectionHeader}>
              <h3 className={inboxSectionTitle}>Stock alerts</h3>
              {hasAlerts && (
                <AppButton variant="ghost" size="sm" onPress={goToDashboard}>
                  Restock
                </AppButton>
              )}
            </div>
            <StockAlertsList />
          </section>
        )}
        <InboxFeed section="updates" onOpen={closeModal} />
      </div>
    </AppModal>
  );
};

export default NotificationCenterModal;
