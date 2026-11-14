import ContentView from "../../components/common/view/ContentView";
import DamagedStockModal from "../../components/movement/modal/DamagedStockModal";
import DamagedPanel from "../../components/movement/panels/DamagedPanel";
import { ROUTES } from "../../routes/route.paths";

const DamagedStockView = () => (
  <ContentView
    title="Record damaged or lost stock"
    subtitle="Pick the product that broke, expired or went missing"
    back={{ label: "Stocks", path: ROUTES.inventory }}
  >
    <DamagedPanel />

    <DamagedStockModal />
  </ContentView>
);

export default DamagedStockView;
