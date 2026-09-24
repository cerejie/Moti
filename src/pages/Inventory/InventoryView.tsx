import ContentView from "../../components/common/view/ContentView";
import CategoryFormModal from "../../components/inventory/modal/CategoryFormModal";
import CategoryManagerModal from "../../components/inventory/modal/CategoryManagerModal";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import InventoryActions from "../../components/inventory/panels/InventoryActions";
import InventoryPanel from "../../components/inventory/panels/InventoryPanel";

const InventoryView = () => (
  <ContentView
    title="Inventory"
    subtitle="Parts on hand, stock status and prices"
    actions={<InventoryActions />}
  >
    <InventoryPanel />
    <ItemFormModal />
    <CategoryManagerModal />
    <CategoryFormModal />
  </ContentView>
);

export default InventoryView;
