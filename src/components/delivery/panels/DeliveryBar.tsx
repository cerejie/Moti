import { PackageCheck } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useDelivery } from "../../../hook/data/delivery/delivery.form.hook";
import { deliveryReviewModalKey } from "../../../keys/modal.keys";
import { reviewBar, reviewBarButton } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Shows once something is picked; the quantities are typed and saved in the review.
const DeliveryBar = () => {
  const { itemCount } = useDelivery();
  const { openModal } = useModal(deliveryReviewModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={reviewBar}>
      <AppButton size="lg" className={reviewBarButton} onPress={() => openModal()}>
        <PackageCheck data-icon="inline-start" aria-hidden />
        Review added stock · {formatCount(itemCount, "product")}
      </AppButton>
    </div>
  );
};

export default DeliveryBar;
