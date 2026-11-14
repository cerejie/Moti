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
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";

const NotificationCenterModal = () => {
  const { receiveStockAlerts } = usePermissions();
  const { modal, closeModal } = useModal(notificationCenterModalKey);
  const alerts = useStockAlerts(receiveStockAlerts);
  const hasAlerts = (alerts.data?.length ?? 0) > 0;
  const navigate = useTransitionNavigate();

  const goToStocks = () => {
    closeModal();
    navigate(ROUTES.inventory);
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
                <AppButton variant="ghost" size="sm" onPress={goToStocks}>
                  View stocks
                </AppButton>
              )}
            </div>
            <StockAlertsList onOpen={closeModal} />
          </section>
        )}
        <InboxFeed section="updates" onOpen={closeModal} />
      </div>
    </AppModal>
  );
};

export default NotificationCenterModal;
