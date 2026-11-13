import { useModal } from "../../../hook/common/modal.hook";
import type { ICountReceipt } from "../../../hook/data/count/count.form.hook";
import { usePushedRoute } from "../../../hook/layout/navigation.hook";
import { countSuccessModalKey } from "../../../keys/modal.keys";
import { receiptLine } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import SuccessModal from "../../common/modal/SuccessModal";

const messageFor = (receipt: ICountReceipt | undefined) => {
  if (receipt?.queued) return "It will be recorded when you're back online.";
  if (receipt?.differenceCount === 0) return "Every shelf matched the app. Nothing changed.";
  return "Stock now matches your count.";
};

// Closing it returns the owner to where the count was started.
const CountSuccessModal = () => {
  const { modal } = useModal<ICountReceipt>(countSuccessModalKey);
  const { goBack } = usePushedRoute();
  const receipt = modal.data;

  return (
    <SuccessModal
      modalKey={countSuccessModalKey}
      title={receipt?.queued ? "Saved offline" : "Count saved"}
      message={messageFor(receipt)}
      okText="Done"
      onClose={goBack}
    >
      {receipt && (
        <p className={receiptLine}>
          {formatCount(receipt.itemCount, "item")} counted ·{" "}
          {formatCount(receipt.differenceCount, "difference")}
        </p>
      )}
    </SuccessModal>
  );
};

export default CountSuccessModal;
