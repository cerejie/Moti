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

// Shows once something is picked; the quantities are checked and saved in the review.
const DeliveryBar = () => {
  const { itemCount, totalQuantity } = useDelivery();
  const { openModal } = useModal(deliveryReviewModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={cartBar}>
      <span className={cartBarText}>
        <span className={cartBarTotal}>{formatCount(totalQuantity, "pc")}</span>
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
