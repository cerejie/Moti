import { PackageOpen } from "lucide-react";
import {
  analysisMinSales,
  analysisPeriodLabels,
  analysisSlowDays,
  coverDayValues,
  type CoverDays,
} from "../../../enums/analyzer.enum";
import {
  useAnalysisScope,
  useStockAnalysis,
} from "../../../hook/data/analyzer/analyzer.list.hook";
import type { ISegmentOption } from "../../../models/common/segment.model";
import { ROUTES } from "../../../routes/route.paths";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import { useAnalyzerStore } from "../../../store/data/analyzer/analyzer.store";
import {
  reorderListHead,
  reorderListTitle,
  reorderRule,
  reorderScope,
  reorderScopeName,
  reorderSetting,
  reorderStack,
  reorderToolbar,
  reorderToolbarLabel,
} from "../../../styles/analyzer/analyzer.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import RefreshBar from "../../common/status/RefreshBar";
import ContextSwitch from "../../common/view/ContextSwitch";
import DisclosureSection from "../../common/view/DisclosureSection";
import OrderAddAllButton from "../../order/menus/OrderAddAllButton";
import OrderAddButton from "../../order/menus/OrderAddButton";
import OrderListBar from "../../order/panels/OrderListBar";
import AnalyzerItemList from "../lists/AnalyzerItemList";
import AnalyzerPeriodSwitch from "../menus/AnalyzerPeriodSwitch";

const renderOrderAction = (row: IStockAnalysisRow) => <OrderAddButton row={row} />;

const coverOptions: ISegmentOption<`${CoverDays}`>[] = coverDayValues.map((days) => ({
  key: `${days}`,
  label: `${days} days`,
}));

const isCoverDays = (value: number): value is CoverDays =>
  coverDayValues.some((days) => days === value);

// What to buy: Buy soon (what is running out) and Most sold (what sells) answer different
// questions, so they are two views of one ranked list, never four panels at once.
const ReorderPanel = () => {
  const { query, period, view, coverDays, setPeriod } = useStockAnalysis();
  const { scopeLabel, aggregate, emptyBranch } = useAnalysisScope();
  const setCoverDays = useAnalyzerStore((state) => state.setCoverDays);
  const groups = query.data;
  const periodLabel = analysisPeriodLabels[period];

  const renderBody = () => {
    if (query.isLoading) {
      return <EmptyState loading description={`Working out sales for the last ${periodLabel}…`} />;
    }
    if (!groups) {
      return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
    }
    if (emptyBranch) {
      return (
        <EmptyState
          icon={<PackageOpen />}
          title={`${emptyBranch} has no products yet`}
          description={`What to buy works from the products a branch has and sells. Add stock to ${emptyBranch} and its suggestions will show here.`}
          action={
            <AppButton variant="outline" href={ROUTES.receiveDelivery}>
              Add stock
            </AppButton>
          }
        />
      );
    }

    if (view === "most_sold") {
      return (
        <SectionCard>
          <div className={reorderListHead}>
            <p className={reorderListTitle}>
              Ranked by units sold in the last {periodLabel}. Selling well doesn't always mean
              buy now: Buy soon also looks at what is available.
            </p>
          </div>
          <AnalyzerItemList
            rows={groups.mostSold}
            kind="fast"
            periodLabel={periodLabel}
            emptyTitle={`No sales in the last ${periodLabel}.`}
          />
        </SectionCard>
      );
    }

    return (
      <>
        <SectionCard>
          <div className={reorderListHead}>
            <p className={reorderListTitle}>
              Out, low, or about to run out within {coverDays} days, most urgent first.
            </p>
            <OrderAddAllButton rows={groups.buySoon} />
          </div>
          <AnalyzerItemList
            rows={groups.buySoon}
            kind="order"
            periodLabel={periodLabel}
            renderAction={renderOrderAction}
            emptyTitle="Nothing needs buying right now."
          />
        </SectionCard>

        {groups.slowStock.length > 0 && (
          <DisclosureSection title={`Not selling (no sale in ${analysisSlowDays} days)`}>
            <AnalyzerItemList
              rows={groups.slowStock}
              kind="slow"
              periodLabel={periodLabel}
              emptyTitle="Everything in stock has sold recently."
            />
          </DisclosureSection>
        )}
      </>
    );
  };

  return (
    <div className={reorderStack}>
      <div className={reorderToolbar}>
        <span className={reorderToolbarLabel}>Sales in the last</span>
        <AnalyzerPeriodSwitch value={period} onChange={setPeriod} />
        {scopeLabel && (
          <span className={reorderScope}>
            Branch: <span className={reorderScopeName}>{scopeLabel}</span>
          </span>
        )}
      </div>

      {query.isFetching && !query.isLoading && <RefreshBar placement="above" />}
      {renderBody()}

      <DisclosureSection title="How suggestions work">
        <div className={reorderRule}>
          <p>
            Pace is the units sold in the last {periodLabel} divided by the days the product was
            on sale in that time (a newer product uses its own age). Cancelled sales don't count.
          </p>
          <p>
            Days left is what is available divided by the pace. The suggestion is enough for{" "}
            {coverDays} days at that pace, minus what is available, rounded up.
          </p>
          <p>
            With fewer than {analysisMinSales} sales there is no estimate, only the real number
            sold. Estimates come from past sales, so they can't promise future demand, and a
            product that was out of stock may have sold less than people wanted.
          </p>
          {aggregate && (
            <p>
              All branches adds every branch together. A product that is low in one branch is
              still flagged here, even when the total looks fine.
            </p>
          )}
          <div className={reorderSetting}>
            <span className={reorderToolbarLabel}>Days of stock to cover</span>
            <ContextSwitch
              label="Days of stock to cover"
              value={`${coverDays}`}
              options={coverOptions}
              onChange={(next) => {
                const days = Number(next);
                if (isCoverDays(days)) setCoverDays(days);
              }}
            />
          </div>
        </div>
      </DisclosureSection>

      <OrderListBar />
    </div>
  );
};

export default ReorderPanel;
