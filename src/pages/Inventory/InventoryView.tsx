import ContentView from "../../components/common/view/ContentView";
import InventoryHeaderActions from "../../components/inventory/menus/InventoryHeaderActions";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import InventoryTable from "../../components/inventory/tables/InventoryTable";
import DamagedStockModal from "../../components/movement/modal/DamagedStockModal";

const InventoryView = () => (
  <ContentView
    title="Inventory"
    subtitle="Every part on the shelf and its stock"
    actions={<InventoryHeaderActions />}
  >
    <InventoryTable />

    <ItemFormModal />
    <DamagedStockModal />
  </ContentView>
);

export default InventoryView;
