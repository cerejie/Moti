import { Check, Plus } from "lucide-react";
import { useAddToOrderList } from "../../../hook/data/order/order.form.hook";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import { orderAddButton, orderAddButtonFull } from "../../../styles/order/order.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  row: IStockAnalysisRow;
  // The item page's full-width button, labelled in full; list rows keep the short "Add".
  full?: boolean;
};

// "Add" until the item is on the order list; its quantity is changed on the list itself.
const OrderAddButton = ({ row, full = false }: IProps) => {
  const { add, isOnList, pending } = useAddToOrderList();
  const className = full ? orderAddButtonFull : orderAddButton;

  if (isOnList(row.item_id)) {
    return (
      <AppButton size="lg" variant="ghost" className={className} disabled>
        <Check data-icon="inline-start" aria-hidden />
        {full ? "On the order list" : "On list"}
      </AppButton>
    );
  }

  return (
    <AppButton
      size="lg"
      variant="outline"
      className={className}
      aria-label={`Add ${row.name} to the order list`}
      disabled={pending}
      onPress={() => add(row)}
    >
      <Plus data-icon="inline-start" aria-hidden />
      {full ? "Add to order list" : "Add"}
    </AppButton>
  );
};

export default OrderAddButton;
