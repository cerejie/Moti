import BrandFormModal from "../../components/brand/modal/BrandFormModal";
import CategoryFormModal from "../../components/category/modal/CategoryFormModal";
import ContentView from "../../components/common/view/ContentView";
import MasterfileFormModal from "../../components/masterfile/modal/MasterfileFormModal";
import MasterfilePanel from "../../components/masterfile/panels/MasterfilePanel";
import { ROUTES } from "../../routes/route.paths";

const MasterfileView = () => (
  <ContentView back={{ label: "Settings", path: ROUTES.settings }}>
    <MasterfilePanel />
    <CategoryFormModal />
    <BrandFormModal />
    <MasterfileFormModal kind="unit" />
    <MasterfileFormModal kind="location" />
  </ContentView>
);

export default MasterfileView;
