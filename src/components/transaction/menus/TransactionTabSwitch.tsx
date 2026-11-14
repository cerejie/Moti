import type { TransactionTab } from "../../../enums/transaction.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { transactionTabKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

const tabOptions: ISegmentOption<TransactionTab>[] = [
  { key: "new", label: "Record sale" },
  { key: "history", label: "Sales history" },
];

// The owner's way to past sales; employees have their own My sales tab instead.
const TransactionTabSwitch = () => {
  const { isOwner } = usePermissions();
  const { filters, setFilters } = useFilters<{ tab?: TransactionTab }>(transactionTabKey);

  if (!isOwner) return null;

  return (
    <ContextSwitch
      label="Sales"
      value={filters.tab ?? "new"}
      options={tabOptions}
      onChange={(next) => setFilters({ tab: next })}
    />
  );
};

export default TransactionTabSwitch;
