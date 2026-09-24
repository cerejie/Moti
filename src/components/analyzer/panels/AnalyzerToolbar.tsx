import { ChevronLeft, ChevronRight } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import DateRangeFilter from "../../common/filter/DateRangeFilter";
import SegmentedControl from "../../common/filter/SegmentedControl";
import {
  analyzerMetricLabels,
  analyzerPeriodLabels,
  type AnalyzerMetric,
  type AnalyzerPeriod,
} from "../../../enums/analyzer.enum";
import {
  useAnalyzerPeriod,
  useAnalyzerView,
} from "../../../hook/data/analyzer/analyzer.list.hook";
import { formatDateRange } from "../../../utils/format.utils";
import {
  analyzerControls,
  analyzerPeriodGroup,
  periodLabel,
  periodStepButton,
  periodStepper,
} from "../../../styles/analyzer/analyzer.styles";

const periodOptions = (Object.keys(analyzerPeriodLabels) as AnalyzerPeriod[]).map((period) => ({
  value: period,
  label: analyzerPeriodLabels[period],
}));

const metricOptions = (Object.keys(analyzerMetricLabels) as AnalyzerMetric[]).map((metric) => ({
  value: metric,
  label: analyzerMetricLabels[metric],
}));

const AnalyzerToolbar = () => {
  const { period, offset, range, today, setPeriod, step, setCustomRange } = useAnalyzerPeriod();
  const { metric, setMetric } = useAnalyzerView();
  const unit = period === "month" ? "month" : "week";

  return (
    <div className={analyzerControls}>
      <div className={analyzerPeriodGroup}>
        <SegmentedControl
          label="Period"
          value={period}
          onValueChange={(value) => setPeriod(value as AnalyzerPeriod)}
          options={periodOptions}
        />

        {period === "custom" ? (
          <DateRangeFilter
            label="Custom date range"
            value={range}
            onChange={setCustomRange}
            maxDate={today ?? undefined}
          />
        ) : (
          <div className={periodStepper}>
            <AppButton
              variant="outline"
              size="icon"
              aria-label={`Previous ${unit}`}
              className={periodStepButton}
              onPress={() => step(-1)}
            >
              <ChevronLeft />
            </AppButton>
            <span className={periodLabel} aria-live="polite">
              {range ? formatDateRange(range.from, range.to) : "—"}
            </span>
            <AppButton
              variant="outline"
              size="icon"
              aria-label={`Next ${unit}`}
              className={periodStepButton}
              disabled={offset === 0}
              onPress={() => step(1)}
            >
              <ChevronRight />
            </AppButton>
          </div>
        )}
      </div>

      <SegmentedControl
        label="Metric"
        value={metric}
        onValueChange={(value) => setMetric(value as AnalyzerMetric)}
        options={metricOptions}
      />
    </div>
  );
};

export default AnalyzerToolbar;
