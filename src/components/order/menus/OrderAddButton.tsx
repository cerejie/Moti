import { Check, Plus } from "lucide-react";
import { useAddToOrderList } from "../../../hook/data/order/order.form.hook";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import { orderAddButton, orderAddButtonFull } from "../../../styles/order/order.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  row: IStockAnalysisRow;
  // The product page's full-width button; list rows say "Add to list" (never a bare "Add",
  // which means adding to a sale).
  full?: boolean;
};

// "Add" until the item is on the buying list; its quantity is changed on the list itself.
const OrderAddButton = ({ row, full = false }: IProps) => {
  const { add, isOnList, pending } = useAddToOrderList();
  const className = full ? orderAddButtonFull : orderAddButton;

  if (isOnList(row.item_id)) {
    return (
      <AppButton size="lg" variant="ghost" className={className} disabled>
        <Check data-icon="inline-start" aria-hidden />
        {full ? "On the buying list" : "On list"}
      </AppButton>
    );
  }

  return (
    <AppButton
      size="lg"
      variant="outline"
      className={className}
      aria-label={`Add ${row.name} to the buying list`}
      disabled={pending}
      onPress={() => add(row)}
    >
      <Plus data-icon="inline-start" aria-hidden />
      {full ? "Add to buying list" : "Add to list"}
    </AppButton>
  );
};

export default OrderAddButton;
