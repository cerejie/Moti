import { useModal } from "../../../hook/common/modal.hook";
import { usePushedRoute } from "../../../hook/layout/navigation.hook";
import { deliverySuccessModalKey } from "../../../keys/modal.keys";
import { receiptLine } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import SuccessModal from "../../common/modal/SuccessModal";

// Superseded by the "Stock added" toast (V1.8); no screen mounts it.
interface IDeliveryReceipt {
  itemCount: number;
  totalQuantity: number;
  queued: boolean;
  fromOrderList: boolean;
}

// Closing it returns the owner to where the delivery was started.
const DeliverySuccessModal = () => {
  const { modal } = useModal<IDeliveryReceipt>(deliverySuccessModalKey);
  const { goBack } = usePushedRoute();
  const receipt = modal.data;

  return (
    <SuccessModal
      modalKey={deliverySuccessModalKey}
      title={receipt?.queued ? "Saved offline" : "Delivery received"}
      message={
        receipt?.queued
          ? "It will be recorded when you're back online."
          : receipt?.fromOrderList
            ? "Stock has been added and the order list updated. Anything that did not arrive stays on it."
            : "Stock has been added."
      }
      okText="Done"
      onClose={goBack}
    >
      {receipt && (
        <p className={receiptLine}>
          {formatCount(receipt.itemCount, "item")} · {formatCount(receipt.totalQuantity, "pc")}
        </p>
      )}
    </SuccessModal>
  );
};

export default DeliverySuccessModal;
