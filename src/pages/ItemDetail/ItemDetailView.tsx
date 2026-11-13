import ContentView from "../../components/common/view/ContentView";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import ItemDetailPanel from "../../components/inventory/panels/ItemDetailPanel";
import DamagedStockModal from "../../components/movement/modal/DamagedStockModal";
import { ROUTES } from "../../routes/route.paths";

const ItemDetailView = () => (
  <ContentView back={{ label: "Inventory", path: ROUTES.inventory }}>
    <ItemDetailPanel />
    <ItemFormModal />
    <DamagedStockModal />
  </ContentView>
);

export default ItemDetailView;
