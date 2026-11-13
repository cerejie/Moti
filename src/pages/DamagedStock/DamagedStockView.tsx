import ContentView from "../../components/common/view/ContentView";
import DamagedStockModal from "../../components/movement/modal/DamagedStockModal";
import DamagedPanel from "../../components/movement/panels/DamagedPanel";
import { ROUTES } from "../../routes/route.paths";

const DamagedStockView = () => (
  <ContentView
    title="Damaged or lost"
    subtitle="Pick the item that broke, expired or went missing"
    back={{ label: "Stock", path: ROUTES.movements }}
  >
    <DamagedPanel />

    <DamagedStockModal />
  </ContentView>
);

export default DamagedStockView;
