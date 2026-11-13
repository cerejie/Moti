import { useModal } from "../../../hook/common/modal.hook";
import type { ICheckoutReceipt } from "../../../hook/data/transaction/transaction.form.hook";
import { checkoutSuccessModalKey } from "../../../keys/modal.keys";
import { receiptLine } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import SuccessModal from "../../common/modal/SuccessModal";

// Closing it leaves the seller on the item list, ready for the next sale.
const CheckoutSuccessModal = () => {
  const { modal } = useModal<ICheckoutReceipt>(checkoutSuccessModalKey);
  const receipt = modal.data;

  return (
    <SuccessModal
      modalKey={checkoutSuccessModalKey}
      title={receipt?.queued ? "Saved offline" : "Sale complete"}
      message={
        receipt?.queued
          ? "It will be recorded when you're back online."
          : "Stock has been deducted."
      }
      okText="New sale"
      onClose={() => undefined}
    >
      {receipt && (
        <p className={receiptLine}>
          {formatCount(receipt.itemCount, "item")} · {formatCount(receipt.totalQuantity, "pc")}
        </p>
      )}
    </SuccessModal>
  );
};

export default CheckoutSuccessModal;
