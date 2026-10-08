import BrandFormModal from "../../components/brand/modal/BrandFormModal";
import CategoryFormModal from "../../components/category/modal/CategoryFormModal";
import ContentView from "../../components/common/view/ContentView";
import MasterfileHeaderActions from "../../components/masterfile/menus/MasterfileHeaderActions";
import MasterfileTabSwitch from "../../components/masterfile/menus/MasterfileTabSwitch";
import MasterfilePanel from "../../components/masterfile/panels/MasterfilePanel";
import { ROUTES } from "../../routes/route.paths";

const MasterfileView = () => (
  <ContentView
    title="Masterfile"
    back={{ label: "Inventory", path: ROUTES.inventory }}
    tabs={<MasterfileTabSwitch />}
    actions={<MasterfileHeaderActions />}
  >
    <MasterfilePanel />
    <CategoryFormModal />
    <BrandFormModal />
  </ContentView>
);

export default MasterfileView;
