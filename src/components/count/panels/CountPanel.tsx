import { countPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CountCategoryButton from "../menus/CountCategoryButton";
import CountPickControl from "../menus/CountPickControl";
import CountBar from "./CountBar";

// Pick products, or filter to a category and take it whole; the bar opens the counts.
const CountPanel = () => (
  <BranchWriteGate
    title="Which branch are you checking?"
    description="A stock count compares one branch's shelves with the quantity in the app."
  >
    {(branchId) => (
      <div className={pickerStack}>
        <CountCategoryButton />
        <ItemPickerTable
          tableKey={countPickTableKey}
          label="Products to check"
          actionTitle="Count"
          branchId={branchId}
          renderAction={(item) => <CountPickControl branchId={branchId} item={item} />}
          fill
        />
        <CountBar />
      </div>
    )}
  </BranchWriteGate>
);

export default CountPanel;
