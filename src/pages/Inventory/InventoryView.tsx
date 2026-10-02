import ContentView from "../../components/common/view/ContentView";
import InventoryHeaderActions from "../../components/inventory/menus/InventoryHeaderActions";
import ItemDetailModal from "../../components/inventory/modal/ItemDetailModal";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import StockMovementModal from "../../components/inventory/modal/StockMovementModal";
import InventoryTable from "../../components/inventory/tables/InventoryTable";

const InventoryView = () => (
  <ContentView
    title="Inventory"
    subtitle="Every part on the shelf, its stock and its price"
    actions={<InventoryHeaderActions />}
  >
    <InventoryTable />

    <ItemFormModal />
    <ItemDetailModal />
    <StockMovementModal />
  </ContentView>
);

export default InventoryView;
