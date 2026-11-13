import { damagedPickTableKey } from "../../../keys/table.keys";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DamagedPickButton from "../menus/DamagedPickButton";

// Find the one item, then the sheet takes the quantity and an optional note.
const DamagedPanel = () => (
  <ItemPickerTable
    tableKey={damagedPickTableKey}
    label="Items to write off"
    actionTitle="Pick"
    renderAction={(item) => <DamagedPickButton item={item} />}
  />
);

export default DamagedPanel;
