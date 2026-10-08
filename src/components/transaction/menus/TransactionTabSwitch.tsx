import type { TransactionTab } from "../../../enums/transaction.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

const tabOptions: ISegmentOption<TransactionTab>[] = [
  { key: "new", label: "New transaction" },
  { key: "history", label: "History" },
];

// Only people who can see past transactions get the switch; everyone else just sells.
const TransactionTabSwitch = () => {
  const { viewTransactions } = usePermissions();
  const { filters, setFilters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);

  if (!viewTransactions) return null;

  return (
    <ContextSwitch
      label="Transaction"
      value={filters.tab ?? "new"}
      options={tabOptions}
      onChange={(next) => setFilters({ tab: next })}
    />
  );
};

export default TransactionTabSwitch;
