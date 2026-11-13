import { useStockTab } from "../../../hook/data/movement/movement.list.hook";
import ReorderPanel from "../../analyzer/panels/ReorderPanel";
import MovementTable from "../tables/MovementTable";

const StockPanel = () => {
  const { tab } = useStockTab();

  return tab === "history" ? <MovementTable /> : <ReorderPanel />;
};

export default StockPanel;
