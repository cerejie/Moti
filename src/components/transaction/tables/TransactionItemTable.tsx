import { transactionPickTableKey } from "../../../keys/table.keys";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CartQuantityControl from "../menus/CartQuantityControl";

type IProps = {
  branchId: string;
};

// The seller searches, filters and adds from one branch's stock; the cart bar below collects the lines.
const TransactionItemTable = ({ branchId }: IProps) => (
  <ItemPickerTable
    tableKey={transactionPickTableKey}
    label="Items to sell"
    actionTitle="Add"
    renderAction={(item) => <CartQuantityControl branchId={branchId} item={item} />}
    topSellersFirst
    branchId={branchId}
  />
);

export default TransactionItemTable;
