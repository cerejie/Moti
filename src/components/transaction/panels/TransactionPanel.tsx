import type { TransactionTab } from "../../../enums/transaction.enum";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import { useFilters } from "../../../hook/common/filter.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import BranchPickPanel from "../../branch/panels/BranchPickPanel";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import TransactionHistoryTable from "../tables/TransactionHistoryTable";
import TransactionItemTable from "../tables/TransactionItemTable";
import CartBar from "./CartBar";

// Pick items, then the cart bar takes the seller to checkout. Owners also get History.
const TransactionPanel = () => {
  const { viewTransactions } = usePermissions();
  const { filters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);
  const { query, writeBranch } = useActiveBranch();

  if (viewTransactions && filters.tab === "history") return <TransactionHistoryTable />;

  if (query.isLoading) return <EmptyState loading description="Loading branches…" />;
  if (query.error) {
    return (
      <ErrorState
        error={query.error}
        title="Couldn't load branches"
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!writeBranch) {
    return (
      <BranchPickPanel
        title="Which branch is selling?"
        description="A sale takes stock from one branch. Pick it to see what's on its shelves."
      />
    );
  }

  return (
    <div className={pickerStack}>
      <TransactionItemTable branchId={writeBranch.id} />
      <CartBar />
    </div>
  );
};

export default TransactionPanel;
