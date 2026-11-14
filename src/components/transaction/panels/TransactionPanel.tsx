import type { TransactionTab } from "../../../enums/transaction.enum";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useFilters } from "../../../hook/common/filter.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import TransactionHistoryTable from "../tables/TransactionHistoryTable";
import TransactionItemTable from "../tables/TransactionItemTable";
import CartBar from "./CartBar";

// Pick items, then the cart bar takes the seller to checkout. Owners also get History.
const TransactionPanel = () => {
  const { viewTransactions } = usePermissions();
  const { filters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);

  if (viewTransactions && filters.tab === "history") return <TransactionHistoryTable />;

  return (
    <BranchWriteGate
      title="Which branch is selling?"
      description="A sale takes stock from one branch. Pick it to see what's on its shelves."
    >
      {(branchId) => (
        <div className={pickerStack}>
          <TransactionItemTable branchId={branchId} />
          <CartBar />
        </div>
      )}
    </BranchWriteGate>
  );
};

export default TransactionPanel;
