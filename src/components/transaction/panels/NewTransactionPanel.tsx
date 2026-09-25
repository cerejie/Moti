import { useIsMobile } from "../../../hook/use-mobile";
import { newTransactionLayout } from "../../../styles/transaction/transaction.styles";
import CartBar from "../cards/CartBar";
import CartPanel from "./CartPanel";
import ProductPanel from "./ProductPanel";

// Products and cart side by side; on phones the products fill the screen and
// the cart opens from the bar pinned above the tab bar.
const NewTransactionPanel = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className={newTransactionLayout}>
        <ProductPanel />
        {!isMobile && <CartPanel />}
      </div>
      {isMobile && <CartBar />}
    </>
  );
};

export default NewTransactionPanel;
