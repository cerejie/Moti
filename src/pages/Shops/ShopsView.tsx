import ContentView from "../../components/common/view/ContentView";
import ShopFormModal from "../../components/shop/modal/ShopFormModal";
import ShopActions from "../../components/shop/panels/ShopActions";
import ShopsPanel from "../../components/shop/panels/ShopsPanel";

const ShopsView = () => (
  <ContentView
    title="Shops"
    subtitle="Every shop on Moti, its users and whether it is active"
    actions={<ShopActions />}
  >
    <ShopsPanel />
    <ShopFormModal />
  </ContentView>
);

export default ShopsView;
