import { PackageMinus } from "lucide-react";
import { useStockActions } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { addButton } from "../../../styles/transaction/transaction.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  item: IInventoryItem;
};

// Nothing on the shelf means nothing to write off.
const DamagedPickButton = ({ item }: IProps) => {
  const { damaged } = useStockActions();
  const empty = item.on_hand === 0;

  return (
    <AppButton
      size="lg"
      variant="outline"
      className={addButton}
      disabled={empty}
      aria-label={empty ? undefined : `Record ${item.name} as damaged or lost`}
      onPress={() => damaged(item)}
    >
      <PackageMinus />
      {empty ? "Out of stock" : "Pick"}
    </AppButton>
  );
};

export default DamagedPickButton;
