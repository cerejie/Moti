import type { TransactionTab } from "../../../enums/transaction.enum";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useFilters } from "../../../hook/common/filter.hook";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import { saleLayout, salePicker } from "../../../styles/transaction/transaction.styles";
import BranchWriteGate from "../../branch/panels/BranchWriteGate";
import TransactionHistoryTable from "../tables/TransactionHistoryTable";
import TransactionItemTable from "../tables/TransactionItemTable";
import PendingSalesNotice from "../status/PendingSalesNotice";
import CartBar from "./CartBar";
import SaleDraftPanel from "./SaleDraftPanel";

// Opens straight on the product list. Phones review through the bar; wide screens keep the
// draft sale beside the list. Owners also read Sales history here.
const TransactionPanel = () => {
  const { isOwner } = usePermissions();
  const isCompact = useIsCompact();
  const { filters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);

  if (isOwner && filters.tab === "history") {
    return (
      <>
        <PendingSalesNotice />
        <TransactionHistoryTable />
      </>
    );
  }

  return (
    <BranchWriteGate
      title="Which branch is selling?"
      description="A sale takes stock from one branch. Pick it to see what's available there."
    >
      {(branchId) => (
        <div className={saleLayout}>
          <div className={salePicker}>
            <PendingSalesNotice />
            <TransactionItemTable branchId={branchId} />
            {isCompact && <CartBar />}
          </div>
          {!isCompact && <SaleDraftPanel />}
        </div>
      )}
    </BranchWriteGate>
  );
};

export default TransactionPanel;
