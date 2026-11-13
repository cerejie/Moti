import { Check, Plus } from "lucide-react";
import { useAddToOrderList } from "../../../hook/data/order/order.form.hook";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import { orderAddButton } from "../../../styles/order/order.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  row: IStockAnalysisRow;
};

// "Add" until the item is on the order list; its quantity is changed on the list itself.
const OrderAddButton = ({ row }: IProps) => {
  const { add, isOnList, pending } = useAddToOrderList();

  if (isOnList(row.item_id)) {
    return (
      <AppButton size="lg" variant="ghost" className={orderAddButton} disabled>
        <Check data-icon="inline-start" aria-hidden />
        On list
      </AppButton>
    );
  }

  return (
    <AppButton
      size="lg"
      variant="outline"
      className={orderAddButton}
      aria-label={`Add ${row.name} to the order list`}
      disabled={pending}
      onPress={() => add(row)}
    >
      <Plus data-icon="inline-start" aria-hidden />
      Add
    </AppButton>
  );
};

export default OrderAddButton;
