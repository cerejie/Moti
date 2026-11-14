import { whatToBuyViewLabels, whatToBuyViewValues, type WhatToBuyView } from "../../../enums/analyzer.enum";
import { useStockAnalysis } from "../../../hook/data/analyzer/analyzer.list.hook";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

const viewOptions: ISegmentOption<WhatToBuyView>[] = whatToBuyViewValues.map((key) => ({
  key,
  label: whatToBuyViewLabels[key],
}));

const WhatToBuyTabSwitch = () => {
  const { view, setView } = useStockAnalysis();

  return <ContextSwitch label="What to buy" value={view} options={viewOptions} onChange={setView} />;
};

export default WhatToBuyTabSwitch;
