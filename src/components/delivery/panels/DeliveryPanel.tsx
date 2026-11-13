import { deliveryPickTableKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import DeliveryQuantityControl from "../menus/DeliveryQuantityControl";
import DeliveryBar from "./DeliveryBar";

// Pick what arrived, then the bar takes the owner to the quantities and one save.
const DeliveryPanel = () => (
  <div className={pickerStack}>
    <ItemPickerTable
      tableKey={deliveryPickTableKey}
      label="Items in this delivery"
      actionTitle="Add"
      renderAction={(item) => <DeliveryQuantityControl item={item} />}
    />
    <DeliveryBar />
  </div>
);

export default DeliveryPanel;
