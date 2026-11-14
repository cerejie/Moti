import { deliveryPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DeliveryQuantityControl from "../menus/DeliveryQuantityControl";
import DeliveryBar from "./DeliveryBar";

// Pick what arrived, then the bar takes the owner to the quantities and one save.
const DeliveryPanel = () => (
  <BranchWriteGate
    title="Which branch is receiving?"
    description="A delivery goes onto one branch's shelves. Pick it to see what it holds."
  >
    {(branchId) => (
      <div className={pickerStack}>
        <ItemPickerTable
          tableKey={deliveryPickTableKey}
          label="Items in this delivery"
          actionTitle="Add"
          branchId={branchId}
          renderAction={(item) => <DeliveryQuantityControl branchId={branchId} item={item} />}
        />
        <DeliveryBar />
      </div>
    )}
  </BranchWriteGate>
);

export default DeliveryPanel;
