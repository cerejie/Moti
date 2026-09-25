import ContentView from "../../components/common/view/ContentView";
import CartSheetModal from "../../components/transaction/modal/CartSheetModal";
import TransactionDetailModal from "../../components/transaction/modal/TransactionDetailModal";
import TransactionSuccessModal from "../../components/transaction/modal/TransactionSuccessModal";
import VoidTransactionModal from "../../components/transaction/modal/VoidTransactionModal";
import TransactionPanel from "../../components/transaction/panels/TransactionPanel";

const TransactionView = () => (
  <ContentView title="Transaction" subtitle="Sell items and look back at past transactions">
    <TransactionPanel />
    <CartSheetModal />
    <TransactionSuccessModal />
    <TransactionDetailModal />
    <VoidTransactionModal />
  </ContentView>
);

export default TransactionView;
