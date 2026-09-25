import DateRangeFilter from "../../common/filter/DateRangeFilter";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SegmentTabs from "../../common/view/SegmentTabs";
import {
  transactionStatusTabLabels,
  type TransactionStatusTab,
} from "../../../enums/transaction.enum";
import {
  useTransactionDateRange,
  useTransactionStatusTab,
} from "../../../hook/data/transaction/transaction.list.hook";
import { transactionTableKey } from "../../../keys/table.keys";
import { historyToolbar } from "../../../styles/transaction/transaction.styles";

const tabs = (Object.keys(transactionStatusTabLabels) as TransactionStatusTab[]).map((key) => ({
  key,
  label: transactionStatusTabLabels[key],
}));

const TransactionHistoryToolbar = () => {
  const { tab, setTab } = useTransactionStatusTab();
  const { range, today, setRange } = useTransactionDateRange();

  return (
    <div className={historyToolbar}>
      <SegmentTabs
        label="Transaction status"
        value={tab}
        onValueChange={(value) => setTab(value as TransactionStatusTab)}
        tabs={tabs}
      />

      <FilterToolbar
        filterKey={transactionTableKey}
        searchKey={transactionTableKey}
        searchPlaceholder="Search transaction no."
      >
        <DateRangeFilter
          label="Date range"
          value={range}
          onChange={setRange}
          maxDate={today ?? undefined}
        />
      </FilterToolbar>
    </div>
  );
};

export default TransactionHistoryToolbar;
