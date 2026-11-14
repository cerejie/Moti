import { damagedPickTableKey } from "../../../keys/table.keys";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DamagedPickButton from "../menus/DamagedPickButton";

// Find the one item, then the sheet takes the quantity and an optional note.
const DamagedPanel = () => (
  <BranchWriteGate
    title="Which branch lost it?"
    description="Damaged or lost stock comes off one branch. Pick it to see what it has."
  >
    {(branchId) => (
      <ItemPickerTable
        tableKey={damagedPickTableKey}
        label="Products"
        actionTitle="Pick"
        branchId={branchId}
        renderAction={(item) => <DamagedPickButton item={item} />}
        fill
      />
    )}
  </BranchWriteGate>
);

export default DamagedPanel;
