import ContentView from "../../components/common/view/ContentView";
import OrderListPanel from "../../components/order/panels/OrderListPanel";
import { ROUTES } from "../../routes/route.paths";

const OrderListView = () => (
  <ContentView
    title="Order list"
    subtitle="Adjust the quantities, share it with your supplier, receive it when it arrives"
    back={{ label: "Stock", path: ROUTES.movements }}
  >
    <OrderListPanel />
  </ContentView>
);

export default OrderListView;
