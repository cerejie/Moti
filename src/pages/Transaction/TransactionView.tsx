import ContentView from "../../components/common/view/ContentView";
import CartModal from "../../components/transaction/modal/CartModal";
import CheckoutSuccessModal from "../../components/transaction/modal/CheckoutSuccessModal";
import TransactionDetailModal from "../../components/transaction/modal/TransactionDetailModal";
import VoidTransactionModal from "../../components/transaction/modal/VoidTransactionModal";
import TransactionPanel from "../../components/transaction/panels/TransactionPanel";

const TransactionView = () => (
  <ContentView title="Transaction" subtitle="Find the items, add them, then check out">
    <TransactionPanel />

    <CartModal />
    <CheckoutSuccessModal />
    <TransactionDetailModal />
    <VoidTransactionModal />
  </ContentView>
);

export default TransactionView;
