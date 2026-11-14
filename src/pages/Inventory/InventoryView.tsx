import ContentView from "../../components/common/view/ContentView";
import InventoryHeaderActions from "../../components/inventory/menus/InventoryHeaderActions";
import ItemFormModal from "../../components/inventory/modal/ItemFormModal";
import InventoryTable from "../../components/inventory/tables/InventoryTable";

const InventoryView = () => (
  <ContentView
    title="Stocks"
    subtitle="What you have left, and what is running low"
    actions={<InventoryHeaderActions />}
  >
    <InventoryTable />

    <ItemFormModal />
  </ContentView>
);

export default InventoryView;
