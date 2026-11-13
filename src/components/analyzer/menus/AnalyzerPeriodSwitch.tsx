import {
  analysisPeriodLabels,
  analysisPeriodValues,
  type AnalysisPeriod,
} from "../../../enums/analyzer.enum";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

type IProps = {
  value: AnalysisPeriod;
  onChange: (next: AnalysisPeriod) => void;
};

const periodOptions: ISegmentOption<AnalysisPeriod>[] = analysisPeriodValues.map((key) => ({
  key,
  label: analysisPeriodLabels[key],
}));

const AnalyzerPeriodSwitch = ({ value, onChange }: IProps) => (
  <ContextSwitch label="Sales period" value={value} options={periodOptions} onChange={onChange} />
);

export default AnalyzerPeriodSwitch;
