import ViewTabs from "../../common/view/ViewTabs";
import {
  inventorySectionLabels,
  type InventorySection,
} from "../../../enums/inventory.enum";
import { useInventorySection } from "../../../hook/data/inventory/inventory.list.hook";
import MovementsPanel from "../../movement/panels/MovementsPanel";
import InventoryPanel from "./InventoryPanel";

// Managers get Items and Movements tabs; everyone else sees the items alone.
const InventorySections = () => {
  const { section, showMovements, setSection } = useInventorySection();

  if (!showMovements) return <InventoryPanel />;

  return (
    <ViewTabs
      label="Inventory views"
      value={section}
      onValueChange={(value) => setSection(value as InventorySection)}
      tabs={[
        { key: "items", label: inventorySectionLabels.items, content: <InventoryPanel /> },
        { key: "movements", label: inventorySectionLabels.movements, content: <MovementsPanel /> },
      ]}
    />
  );
};

export default InventorySections;
