import ContentView from "../../components/common/view/ContentView";
import DeliveryReviewModal from "../../components/delivery/modal/DeliveryReviewModal";
import DeliverySuccessModal from "../../components/delivery/modal/DeliverySuccessModal";
import DeliveryPanel from "../../components/delivery/panels/DeliveryPanel";
import { ROUTES } from "../../routes/route.paths";

const ReceiveDeliveryView = () => (
  <ContentView
    title="Receive delivery"
    subtitle="Add what arrived, check the quantities, save once"
    back={{ label: "Stock", path: ROUTES.movements }}
  >
    <DeliveryPanel />

    <DeliveryReviewModal />
    <DeliverySuccessModal />
  </ContentView>
);

export default ReceiveDeliveryView;
