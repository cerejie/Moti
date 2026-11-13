import {
  analysisCoverDays,
  analysisMinSales,
  analysisPeriodLabels,
  analysisSlowDays,
} from "../../../enums/analyzer.enum";
import { useStockAnalysis } from "../../../hook/data/analyzer/analyzer.list.hook";
import {
  reorderGrid,
  reorderRule,
  reorderStack,
  reorderToolbar,
  reorderToolbarLabel,
} from "../../../styles/analyzer/analyzer.styles";
import SectionCard from "../../common/card/SectionCard";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import AnalyzerItemList from "../lists/AnalyzerItemList";
import AnalyzerPeriodSwitch from "../menus/AnalyzerPeriodSwitch";

// What to order first, worked out from the period's sales; every rule is spelled out under it.
const ReorderPanel = () => {
  const { query, period, setPeriod } = useStockAnalysis();
  const groups = query.data;
  const periodLabel = analysisPeriodLabels[period];

  const renderBody = () => {
    if (query.isLoading) return <EmptyState loading description="Working out what to order…" />;
    if (!groups) {
      return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
    }

    return (
      <>
        <BentoGrid className={reorderGrid}>
          <BentoCell span="half">
            <SectionCard
              title="Order now"
              subtitle={`Out, low, or under ${analysisCoverDays} days left`}
            >
              <AnalyzerItemList
                rows={groups.orderNow}
                kind="order"
                emptyTitle="Nothing to order right now."
              />
            </SectionCard>
          </BentoCell>
          <BentoCell span="half">
            <SectionCard
              title="Running low soon"
              subtitle={`Under ${analysisCoverDays * 2} days left`}
            >
              <AnalyzerItemList
                rows={groups.lowSoon}
                kind="order"
                emptyTitle="Nothing is running low."
              />
            </SectionCard>
          </BentoCell>
          <BentoCell span="half">
            <SectionCard title="Fast movers" subtitle={`Most sold in ${periodLabel}`}>
              <AnalyzerItemList
                rows={groups.fastMovers}
                kind="fast"
                emptyTitle={`No sales in ${periodLabel}.`}
              />
            </SectionCard>
          </BentoCell>
          <BentoCell span="half">
            <SectionCard
              title="Slow stock"
              subtitle={`In stock, no sale in ${analysisSlowDays} days`}
            >
              <AnalyzerItemList rows={groups.slowStock} kind="slow" emptyTitle="No slow stock." />
            </SectionCard>
          </BentoCell>
        </BentoGrid>

        <p className={reorderRule}>
          Pace is the pieces sold in {periodLabel} divided by the days. Days left is on hand
          divided by pace. To order is enough for {analysisCoverDays} days, minus what is on
          hand. Items with fewer than {analysisMinSales} sales show “Not enough sales yet”.
        </p>
      </>
    );
  };

  return (
    <div className={reorderStack}>
      <div className={reorderToolbar}>
        <span className={reorderToolbarLabel}>Sales over the last</span>
        <AnalyzerPeriodSwitch value={period} onChange={setPeriod} />
      </div>
      {renderBody()}
    </div>
  );
};

export default ReorderPanel;
