import { PackageCheck } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useDelivery } from "../../../hook/data/delivery/delivery.form.hook";
import { deliveryReviewModalKey } from "../../../keys/modal.keys";
import { itemMeta } from "../../../styles/inventory/inventory.styles";
import {
  cartBar,
  cartBarText,
  cartBarTotal,
} from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import CountUp from "../../common/view/CountUp";

const formatPieces = (count: number) => formatCount(count, "pc");

// Shows once something is picked; the quantities are checked and saved in the review.
const DeliveryBar = () => {
  const { itemCount, totalQuantity } = useDelivery();
  const { openModal } = useModal(deliveryReviewModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={cartBar}>
      <span className={cartBarText}>
        <CountUp value={totalQuantity} format={formatPieces} bump className={cartBarTotal} />
        <span className={itemMeta}>{formatCount(itemCount, "item")}</span>
      </span>
      <AppButton size="lg" onPress={() => openModal()}>
        <PackageCheck />
        Review delivery
      </AppButton>
    </div>
  );
};

export default DeliveryBar;
