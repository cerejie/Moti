import { countPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CountCategoryButton from "../menus/CountCategoryButton";
import CountPickControl from "../menus/CountPickControl";
import CountBar from "./CountBar";

// Pick items, or filter to a category and take it whole; the bar opens the shelf counts.
const CountPanel = () => (
  <div className={pickerStack}>
    <CountCategoryButton />
    <ItemPickerTable
      tableKey={countPickTableKey}
      label="Items to count"
      actionTitle="Count"
      renderAction={(item) => <CountPickControl item={item} />}
    />
    <CountBar />
  </div>
);

export default CountPanel;
