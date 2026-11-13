import { ClipboardCheck } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useCount } from "../../../hook/data/count/count.form.hook";
import { countModalKey } from "../../../keys/modal.keys";
import { itemMeta } from "../../../styles/inventory/inventory.styles";
import {
  cartBar,
  cartBarText,
  cartBarTotal,
} from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Shows once something is picked; the shelf counts are typed in the count sheet.
const CountBar = () => {
  const { itemCount, uncountedCount, setStep } = useCount();
  const { openModal } = useModal(countModalKey);

  if (itemCount === 0) return null;

  const countedCount = itemCount - uncountedCount;

  return (
    <div className={cartBar}>
      <span className={cartBarText}>
        <span className={cartBarTotal}>{formatCount(itemCount, "item")}</span>
        <span className={itemMeta}>{countedCount} counted</span>
      </span>
      <AppButton
        size="lg"
        onPress={() => {
          setStep("count");
          openModal();
        }}
      >
        <ClipboardCheck />
        Enter counts
      </AppButton>
    </div>
  );
};

export default CountBar;
