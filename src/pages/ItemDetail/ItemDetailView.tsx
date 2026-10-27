import ContentView from "../../components/common/view/ContentView";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import StockMovementModal from "../../components/inventory/modal/StockMovementModal";
import ItemDetailPanel from "../../components/inventory/panels/ItemDetailPanel";
import { ROUTES } from "../../routes/route.paths";

const ItemDetailView = () => (
  <ContentView back={{ label: "Inventory", path: ROUTES.inventory }}>
    <ItemDetailPanel />
    <ItemFormModal />
    <StockMovementModal />
  </ContentView>
);

export default ItemDetailView;
