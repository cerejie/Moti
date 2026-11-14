import ContentView from "../../components/common/view/ContentView";
import OrderListPanel from "../../components/order/panels/OrderListPanel";
import { ROUTES } from "../../routes/route.paths";

const OrderListView = () => (
  <ContentView
    title="Buying list"
    subtitle="A planning list to adjust and share. It doesn't add stock or place an order; use Add stock when products arrive."
    back={{ label: "What to buy", path: ROUTES.whatToBuy }}
  >
    <OrderListPanel />
  </ContentView>
);

export default OrderListView;
