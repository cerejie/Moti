import ContentView from "../../components/common/view/ContentView";
import VoidTransactionModal from "../../components/transaction/modal/VoidTransactionModal";
import TransactionDetailPanel from "../../components/transaction/panels/TransactionDetailPanel";
import { ROUTES } from "../../routes/route.paths";

const TransactionDetailView = () => (
  <ContentView back={{ label: "Transaction", path: ROUTES.transaction }}>
    <TransactionDetailPanel />
    <VoidTransactionModal />
  </ContentView>
);

export default TransactionDetailView;
