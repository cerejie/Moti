import { ClipboardCheck } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCount } from "../../../hook/data/count/count.form.hook";
import { countModalKey } from "../../../keys/modal.keys";
import { reviewBar, reviewBarButton } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Shows once something is picked; the actual quantities are typed in the count sheet.
const CountBar = () => {
  const { itemCount, setStep } = useCount();
  const { openModal } = useModal(countModalKey);

  if (itemCount === 0) return null;

  return (
    <div className={reviewBar}>
      <AppButton
        size="lg"
        className={reviewBarButton}
        onPress={() => {
          setStep("count");
          openModal();
        }}
      >
        <ClipboardCheck data-icon="inline-start" aria-hidden />
        Enter counts · {formatCount(itemCount, "product")}
      </AppButton>
    </div>
  );
};

export default CountBar;
