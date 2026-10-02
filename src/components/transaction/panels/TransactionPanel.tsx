import type { TransactionTab } from "../../../enums/transaction.enum";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useFilters } from "../../../hook/common/filter.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import { pickerStack } from "../../../styles/transaction/transaction.styles";
import ViewTabs from "../../common/view/ViewTabs";
import TransactionHistoryTable from "../tables/TransactionHistoryTable";
import TransactionItemTable from "../tables/TransactionItemTable";
import CartBar from "./CartBar";

// Pick items, then the cart bar takes the seller to checkout. Owners also get History.
const TransactionPanel = () => {
  const { viewTransactions } = usePermissions();
  const { filters, setFilters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);

  const picker = (
    <div className={pickerStack}>
      <TransactionItemTable />
      <CartBar />
    </div>
  );

  if (!viewTransactions) return picker;

  return (
    <ViewTabs
      label="Transaction"
      value={filters.tab ?? "new"}
      onValueChange={(next) => setFilters({ tab: next as TransactionTab })}
      tabs={[
        { key: "new", label: "New transaction", content: picker },
        { key: "history", label: "History", content: <TransactionHistoryTable /> },
      ]}
    />
  );
};

export default TransactionPanel;
