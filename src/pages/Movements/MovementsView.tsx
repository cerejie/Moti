import ContentView from "../../components/common/view/ContentView";
import StockActions from "../../components/movement/menus/StockActions";
import StockTabSwitch from "../../components/movement/menus/StockTabSwitch";
import StockPanel from "../../components/movement/panels/StockPanel";

const MovementsView = () => (
  <ContentView
    title="Stock"
    subtitle="Receive, count and write off stock; see what to order next"
    actions={<StockActions />}
    tabs={<StockTabSwitch />}
  >
    <StockPanel />
  </ContentView>
);

export default MovementsView;
