import { Store } from "lucide-react";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import ViewTabs from "../../common/view/ViewTabs";
import { analyzerTabLabels, type AnalyzerTab } from "../../../enums/analyzer.enum";
import { useAnalyzerView } from "../../../hook/data/analyzer/analyzer.list.hook";
import { useActiveShop, useShopTimezone } from "../../../hook/data/shop/shop.list.hook";
import RankingPanel from "./RankingPanel";
import ReorderPanel from "./ReorderPanel";

const AnalyzerPanel = () => {
  const { shopId } = useActiveShop();
  const { isError, error, refetch } = useShopTimezone();
  const { tab, setTab } = useAnalyzerView();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to analyze its stock.
      </StateBox>
    );
  }

  // Every period is read in the shop's timezone; while it loads the tabs show their skeletons.
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <ViewTabs
      label="Analyzer views"
      value={tab}
      onValueChange={(value) => setTab(value as AnalyzerTab)}
      tabs={[
        { key: "ranking", label: analyzerTabLabels.ranking, content: <RankingPanel /> },
        { key: "reorder", label: analyzerTabLabels.reorder, content: <ReorderPanel /> },
      ]}
    />
  );
};

export default AnalyzerPanel;
