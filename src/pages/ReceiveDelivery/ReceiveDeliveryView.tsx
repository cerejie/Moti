import ContentView from "../../components/common/view/ContentView";
import DeliveryReviewModal from "../../components/delivery/modal/DeliveryReviewModal";
import DeliveryPanel from "../../components/delivery/panels/DeliveryPanel";
import { ROUTES } from "../../routes/route.paths";

const ReceiveDeliveryView = () => (
  <ContentView
    title="Add stock"
    subtitle="Pick the products that arrived, type how many, save once"
    back={{ label: "Stocks", path: ROUTES.inventory }}
    layout="fill"
  >
    <DeliveryPanel />

    <DeliveryReviewModal />
  </ContentView>
);

export default ReceiveDeliveryView;
