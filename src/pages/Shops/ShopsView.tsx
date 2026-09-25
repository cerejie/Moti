import ContentView from "../../components/common/view/ContentView";
import ShopFormModal from "../../components/shop/modal/ShopFormModal";
import ShopActions from "../../components/shop/panels/ShopActions";
import ShopsPanel from "../../components/shop/panels/ShopsPanel";
import { ROUTES } from "../../routes/route.paths";

const ShopsView = () => (
  <ContentView back={{ label: "Settings", path: ROUTES.settings }} actions={<ShopActions />}>
    <ShopsPanel />
    <ShopFormModal />
  </ContentView>
);

export default ShopsView;
