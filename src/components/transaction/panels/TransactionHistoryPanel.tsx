import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useTransactionDetail } from "../../../hook/data/transaction/transaction.form.hook";
import { useTransactionList } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionTableKey } from "../../../keys/table.keys";
import TransactionTable from "../tables/TransactionTable";
import TransactionHistoryToolbar from "./TransactionHistoryToolbar";

const TransactionHistoryPanel = () => {
  const { data, isLoading, isError, error, refetch } = useTransactionList();
  const { openDetail } = useTransactionDetail();
  // Employees only ever see their own, so the "By" column is for managers.
  const { voidTransaction: seesEveryone } = usePermissions();

  return (
    <TablePanel
      toolbar={<TransactionHistoryToolbar />}
      footer={
        <TablePagination
          paginationKey={transactionTableKey}
          totalCount={data?.totalCount ?? 0}
        />
      }
    >
      <TransactionTable
        transactions={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        showCreatedBy={seesEveryone}
        onOpen={openDetail}
        emptyText="No transactions match these filters."
      />
    </TablePanel>
  );
};

export default TransactionHistoryPanel;
