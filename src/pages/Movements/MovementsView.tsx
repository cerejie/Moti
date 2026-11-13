import ContentView from "../../components/common/view/ContentView";
import StockTabSwitch from "../../components/movement/menus/StockTabSwitch";
import StockPanel from "../../components/movement/panels/StockPanel";

const MovementsView = () => (
  <ContentView
    title="Stock"
    subtitle="What to order next, and every stock change"
    tabs={<StockTabSwitch />}
  >
    <StockPanel />
  </ContentView>
);

export default MovementsView;
