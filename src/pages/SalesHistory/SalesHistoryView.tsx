import ContentView from "../../components/common/view/ContentView";
import TransactionHistoryTable from "../../components/transaction/tables/TransactionHistoryTable";
import PendingSalesNotice from "../../components/transaction/status/PendingSalesNotice";

const SalesHistoryView = () => (
  <ContentView title="My sales" subtitle="The sales you recorded, newest first" layout="fill">
    <PendingSalesNotice />
    <TransactionHistoryTable />
  </ContentView>
);

export default SalesHistoryView;
