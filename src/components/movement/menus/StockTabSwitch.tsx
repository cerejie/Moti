import type { StockTab } from "../../../enums/stock.enum";
import { useStockTab } from "../../../hook/data/movement/movement.list.hook";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

const tabOptions: ISegmentOption<StockTab>[] = [
  { key: "reorder", label: "Reorder" },
  { key: "history", label: "History" },
];

const StockTabSwitch = () => {
  const { tab, setTab } = useStockTab();

  return <ContextSwitch label="Stock" value={tab} options={tabOptions} onChange={setTab} />;
};

export default StockTabSwitch;
