import ContentView from "../../components/common/view/ContentView";
import CartModal from "../../components/transaction/modal/CartModal";
import TransactionTabSwitch from "../../components/transaction/menus/TransactionTabSwitch";
import TransactionPanel from "../../components/transaction/panels/TransactionPanel";

const TransactionView = () => (
  <ContentView
    title="Sales"
    subtitle="Add the products sold, review, then save the sale"
    tabs={<TransactionTabSwitch />}
    layout="fill"
  >
    <TransactionPanel />

    <CartModal />
  </ContentView>
);

export default TransactionView;
