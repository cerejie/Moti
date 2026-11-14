import { deliveryPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DeliveryQuantityControl from "../menus/DeliveryQuantityControl";
import DeliveryBar from "./DeliveryBar";

// Pick what arrived, then the bar takes the owner to the quantities and one save.
// No supplier, invoice or order is asked for: this only records stock that arrived.
const DeliveryPanel = () => (
  <BranchWriteGate
    title="Which branch is the stock for?"
    description="Added stock goes to one branch. Pick it to see what it has now."
  >
    {(branchId) => (
      <div className={pickerStack}>
        <ItemPickerTable
          tableKey={deliveryPickTableKey}
          label="Products received"
          actionTitle="Add"
          branchId={branchId}
          renderAction={(item) => <DeliveryQuantityControl branchId={branchId} item={item} />}
          fill
        />
        <DeliveryBar />
      </div>
    )}
  </BranchWriteGate>
);

export default DeliveryPanel;
