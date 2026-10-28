import ContentView from "../../components/common/view/ContentView";
import CartModal from "../../components/transaction/modal/CartModal";
import CheckoutSuccessModal from "../../components/transaction/modal/CheckoutSuccessModal";
import TransactionTabSwitch from "../../components/transaction/menus/TransactionTabSwitch";
import TransactionPanel from "../../components/transaction/panels/TransactionPanel";

const TransactionView = () => (
  <ContentView
    title="Transaction"
    subtitle="Find the items, add them, then check out"
    tabs={<TransactionTabSwitch />}
  >
    <TransactionPanel />

    <CartModal />
    <CheckoutSuccessModal />
  </ContentView>
);

export default TransactionView;
