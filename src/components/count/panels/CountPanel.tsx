import { countPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CountCategoryButton from "../menus/CountCategoryButton";
import CountPickControl from "../menus/CountPickControl";
import CountBar from "./CountBar";

// Pick items, or filter to a category and take it whole; the bar opens the shelf counts.
const CountPanel = () => (
  <BranchWriteGate
    title="Which branch are you counting?"
    description="A count checks one branch's shelves against what the app says it holds."
  >
    {(branchId) => (
      <div className={pickerStack}>
        <CountCategoryButton />
        <ItemPickerTable
          tableKey={countPickTableKey}
          label="Items to count"
          actionTitle="Count"
          branchId={branchId}
          renderAction={(item) => <CountPickControl branchId={branchId} item={item} />}
        />
        <CountBar />
      </div>
    )}
  </BranchWriteGate>
);

export default CountPanel;
