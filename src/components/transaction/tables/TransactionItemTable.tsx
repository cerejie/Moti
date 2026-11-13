import { transactionPickTableKey } from "../../../keys/table.keys";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CartQuantityControl from "../menus/CartQuantityControl";

// The seller searches, filters and adds; the cart bar below collects the lines.
const TransactionItemTable = () => (
  <ItemPickerTable
    tableKey={transactionPickTableKey}
    label="Items to sell"
    actionTitle="Add"
    renderAction={(item) => <CartQuantityControl item={item} />}
    topSellersFirst
  />
);

export default TransactionItemTable;
