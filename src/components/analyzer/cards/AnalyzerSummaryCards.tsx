import { Boxes, Package, PackageMinus, Trophy } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import InfoHint from "../../common/view/InfoHint";
import {
  itemCountFormulas,
  quantityFormulas,
  topItemFormula,
  unsoldStockedFormula,
} from "../../../enums/analyzer.enum";
import { usePeriodSummary } from "../../../hook/data/analyzer/analyzer.list.hook";
import { formatCount } from "../../../utils/format.utils";
import {
  summaryGrid,
  summaryWideTile,
  topItemName,
} from "../../../styles/analyzer/analyzer.styles";

const formulaHint = (label: string, text: string) => (
  <InfoHint label={`How ${label.toLowerCase()} is counted`} items={[{ label, text }]} />
);

const AnalyzerSummaryCards = () => {
  const { data, isLoading, isError, error, refetch, metric } = usePeriodSummary();

  if (isLoading) return <StateBox loading title="Loading period summary…" />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const sold = metric === "sold";
  const unitsLabel = sold ? "Units sold" : "Units added";
  const itemsLabel = sold ? "Items sold" : "Items added";
  const emptyTopHint = sold ? "Nothing sold in this period" : "Nothing added in this period";
  const topHint =
    data.top_item_quantity === null
      ? emptyTopHint
      : `${formatCount(data.top_item_quantity)} ${data.top_item_unit ?? ""}`.trim();

  return (
    <div className={summaryGrid}>
      <StatCard
        label={unitsLabel}
        value={formatCount(data.total_units)}
        icon={<Boxes />}
        trailing={formulaHint(unitsLabel, quantityFormulas[metric])}
      />
      <StatCard
        label={itemsLabel}
        value={formatCount(data.item_count)}
        icon={<Package />}
        trailing={formulaHint(itemsLabel, itemCountFormulas[metric])}
      />
      <StatCard
        label="Top item"
        value={<span className={topItemName}>{data.top_item_name ?? "—"}</span>}
        hint={topHint}
        icon={<Trophy />}
        trailing={formulaHint("Top item", topItemFormula)}
        // Under Added the three tiles would leave the last phone row with one.
        className={sold ? undefined : summaryWideTile}
      />
      {sold && (
        <StatCard
          label="Stocked, not sold"
          value={formatCount(data.unsold_stocked_count)}
          icon={<PackageMinus />}
          tone={data.unsold_stocked_count > 0 ? "warning" : "neutral"}
          trailing={formulaHint("Stocked, not sold", unsoldStockedFormula)}
        />
      )}
    </div>
  );
};

export default AnalyzerSummaryCards;
