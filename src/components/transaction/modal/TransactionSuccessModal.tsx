import SuccessModal from "../../common/modal/SuccessModal";
import { useTransactionSuccess } from "../../../hook/data/transaction/transaction.form.hook";
import { transactionSuccessModalKey } from "../../../keys/modal.keys";

const noop = () => undefined;

// After Confirm: the transaction number, or that it waits to sync.
const TransactionSuccessModal = () => {
  const { title, message } = useTransactionSuccess();

  return (
    <SuccessModal
      modalKey={transactionSuccessModalKey}
      title={title}
      message={message}
      okText="New transaction"
      onClose={noop}
    />
  );
};

export default TransactionSuccessModal;
