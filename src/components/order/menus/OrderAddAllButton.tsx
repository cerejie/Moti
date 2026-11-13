import { ListPlus } from "lucide-react";
import { useAddToOrderList } from "../../../hook/data/order/order.form.hook";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import AppButton from "../../common/button/AppButton";

type IProps = {
  rows: readonly IStockAnalysisRow[];
};

// Puts every Order now item on the list with its suggested quantity; ones already on it stay as they are.
const OrderAddAllButton = ({ rows }: IProps) => {
  const { addAll, isOnList, pending } = useAddToOrderList();
  const allOnList = rows.every((row) => isOnList(row.item_id));

  if (rows.length === 0) return null;

  return (
    <AppButton
      size="lg"
      variant="outline"
      disabled={pending || allOnList}
      onPress={() => addAll(rows)}
    >
      <ListPlus data-icon="inline-start" aria-hidden />
      {allOnList ? "All on list" : "Add all suggestions"}
    </AppButton>
  );
};

export default OrderAddAllButton;
