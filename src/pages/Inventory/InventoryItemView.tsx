import ContentView from "../../components/common/view/ContentView";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import ItemDetailPanel from "../../components/inventory/panels/ItemDetailPanel";
import { ROUTES } from "../../routes/route.paths";

const InventoryItemView = () => (
  <ContentView back={{ label: "Inventory", path: ROUTES.inventory }}>
    <ItemDetailPanel />
    <ItemFormModal />
  </ContentView>
);

export default InventoryItemView;
