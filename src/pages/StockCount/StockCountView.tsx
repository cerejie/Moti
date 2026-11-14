import ContentView from "../../components/common/view/ContentView";
import CountModal from "../../components/count/modal/CountModal";
import CountPanel from "../../components/count/panels/CountPanel";
import { ROUTES } from "../../routes/route.paths";

const StockCountView = () => (
  <ContentView
    title="Check stock count"
    subtitle="Pick products or a whole category, then type the actual quantity you count"
    back={{ label: "Stocks", path: ROUTES.inventory }}
    layout="fill"
  >
    <CountPanel />

    <CountModal />
  </ContentView>
);

export default StockCountView;
