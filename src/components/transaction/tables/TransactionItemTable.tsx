import { transactionPickTableKey } from "../../../keys/table.keys";
import ItemPickerTable from "../../inventory/tables/ItemPickerTable";
import CartQuantityControl from "../menus/CartQuantityControl";

type IProps = {
  branchId: string;
};

// The seller searches the branch's products, best sellers first, and adds them to the draft.
const TransactionItemTable = ({ branchId }: IProps) => (
  <ItemPickerTable
    tableKey={transactionPickTableKey}
    label="Products to sell"
    actionTitle="Quantity"
    renderAction={(item) => <CartQuantityControl branchId={branchId} item={item} />}
    topSellersFirst
    branchId={branchId}
    hideStatus
    fill
  />
);

export default TransactionItemTable;
