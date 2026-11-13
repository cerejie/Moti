import ContentView from "../../components/common/view/ContentView";
import CountModal from "../../components/count/modal/CountModal";
import CountSuccessModal from "../../components/count/modal/CountSuccessModal";
import CountPanel from "../../components/count/panels/CountPanel";
import { ROUTES } from "../../routes/route.paths";

const StockCountView = () => (
  <ContentView
    title="Count stock"
    subtitle="Pick items or a whole category, then type what is on the shelf"
    back={{ label: "Stock", path: ROUTES.movements }}
  >
    <CountPanel />

    <CountModal />
    <CountSuccessModal />
  </ContentView>
);

export default StockCountView;
