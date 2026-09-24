import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import InfoHint from "../../common/view/InfoHint";
import {
  analyzerMetricLabels,
  periodDaysFormula,
  quantityFormulas,
  rankFormula,
  transactionFormulas,
} from "../../../enums/analyzer.enum";
import { useVolumeRanking } from "../../../hook/data/analyzer/analyzer.list.hook";
import { analyzerTableKey } from "../../../keys/table.keys";
import { formatDateRange } from "../../../utils/format.utils";
import { analyzerStack } from "../../../styles/analyzer/analyzer.styles";
import AnalyzerSummaryCards from "../cards/AnalyzerSummaryCards";
import VolumeRankingTable from "../tables/VolumeRankingTable";
import AnalyzerToolbar from "./AnalyzerToolbar";
import RankingToolbar from "./RankingToolbar";

const RankingPanel = () => {
  const { data, isLoading, isError, error, refetch, range, metric, openItem } =
    useVolumeRanking();

  return (
    <div className={analyzerStack}>
      <AnalyzerToolbar />
      <AnalyzerSummaryCards />

      <TablePanel
        title="Ranking"
        description={range ? formatDateRange(range.from, range.to) : undefined}
        actions={
          <InfoHint
            label="How the ranking is counted"
            items={[
              { label: "Rank", text: rankFormula },
              { label: analyzerMetricLabels[metric], text: quantityFormulas[metric] },
              { label: "Transactions", text: transactionFormulas[metric] },
              { label: "Dates", text: periodDaysFormula },
            ]}
          />
        }
        toolbar={<RankingToolbar />}
        footer={
          <TablePagination
            paginationKey={analyzerTableKey}
            totalCount={data?.totalCount ?? 0}
          />
        }
      >
        <VolumeRankingTable
          rows={data?.data ?? []}
          metric={metric}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
          onOpen={openItem}
        />
      </TablePanel>
    </div>
  );
};

export default RankingPanel;
