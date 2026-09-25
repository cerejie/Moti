import BrandFormModal from "../../components/brand/modal/BrandFormModal";
import CategoryFormModal from "../../components/category/modal/CategoryFormModal";
import ContentView from "../../components/common/view/ContentView";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import InventoryActions from "../../components/inventory/panels/InventoryActions";
import InventorySections from "../../components/inventory/panels/InventorySections";
import StockMovementModal from "../../components/movement/modal/StockMovementModal";

// The category and brand forms follow the item form, so they open on top of it.
const InventoryView = () => (
  <ContentView
    title="Inventory"
    subtitle="Parts on hand, stock status, prices and every movement"
    actions={<InventoryActions />}
  >
    <InventorySections />
    <ItemFormModal />
    <CategoryFormModal />
    <BrandFormModal />
    <StockMovementModal />
  </ContentView>
);

export default InventoryView;
