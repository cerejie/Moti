import { damagedPickTableKey } from "../../../keys/table.keys";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DamagedPickButton from "../menus/DamagedPickButton";

// Find the one item, then the sheet takes the quantity and an optional note.
const DamagedPanel = () => (
  <BranchWriteGate
    title="Which branch lost it?"
    description="A write-off comes off one branch's shelves. Pick it to see what it holds."
  >
    {(branchId) => (
      <ItemPickerTable
        tableKey={damagedPickTableKey}
        label="Items to write off"
        actionTitle="Pick"
        branchId={branchId}
        renderAction={(item) => <DamagedPickButton item={item} />}
      />
    )}
  </BranchWriteGate>
);

export default DamagedPanel;
