import { Check, Plus } from "lucide-react";
import { useCount } from "../../../hook/data/count/count.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { selectIsCounting, useCountStore } from "../../../store/data/count/count.store";
import { addButton } from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  branchId: string;
  item: IInventoryItem;
};

// The shelf count itself is typed in the count sheet; here an item only joins or leaves it.
const CountPickControl = ({ branchId, item }: IProps) => {
  const { add, remove } = useCount();
  const counting = useCountStore(selectIsCounting(item.id));

  if (counting) {
    return (
      <AppButton
        size="lg"
        variant="outline"
        className={addButton}
        aria-label={`Remove ${item.name} from the count`}
        onPress={() => remove(item.id)}
      >
        <Check />
        Added
      </AppButton>
    );
  }

  return (
    <AppButton size="lg" className={addButton} onPress={() => add(branchId, item)}>
      <Plus />
      Add
    </AppButton>
  );
};

export default CountPickControl;
