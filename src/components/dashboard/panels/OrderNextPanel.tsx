import { analysisPeriodLabels, defaultAnalysisPeriod } from "../../../enums/analyzer.enum";
import { useOrderNext } from "../../../hook/data/analyzer/analyzer.list.hook";
import { useStockTab } from "../../../hook/data/movement/movement.list.hook";
import { ROUTES } from "../../../routes/route.paths";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import AnalyzerItemList from "../../analyzer/lists/AnalyzerItemList";
import OrderAddButton from "../../order/menus/OrderAddButton";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";

const renderOrderAction = (row: IStockAnalysisRow) => <OrderAddButton row={row} />;

// The top of Stock · Reorder, so the owner sees what to buy without leaving Home.
const OrderNextPanel = () => {
  const orderNext = useOrderNext();
  const { setTab } = useStockTab();

  return (
    <SectionCard
      title="Order next"
      subtitle={`From the last ${analysisPeriodLabels[defaultAnalysisPeriod]} of sales`}
      extra={
        <AppButton href={ROUTES.movements} variant="link" onPress={() => setTab("reorder")}>
          See all
        </AppButton>
      }
      loading={orderNext.isLoading}
      error={orderNext.error}
      onRetry={() => void orderNext.refetch()}
    >
      <AnalyzerItemList
        rows={orderNext.data ?? []}
        kind="order"
        periodLabel={analysisPeriodLabels[defaultAnalysisPeriod]}
        renderAction={renderOrderAction}
        emptyTitle="Nothing to order right now."
      />
    </SectionCard>
  );
};

export default OrderNextPanel;
