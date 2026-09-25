import { Boxes, Package, PackageMinus, Trophy } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import ErrorState from "../../common/status/ErrorState";
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

  if (isError || (!isLoading && !data)) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const sold = metric === "sold";
  const unitsLabel = sold ? "Units sold" : "Units added";
  const itemsLabel = sold ? "Items sold" : "Items added";
  const emptyTopHint = sold ? "Nothing sold in this period" : "Nothing added in this period";
  // The hint line is held while loading so the tile keeps its height.
  const topHint = !data
    ? "Loading…"
    : data.top_item_quantity === null
      ? emptyTopHint
      : `${formatCount(data.top_item_quantity)} ${data.top_item_unit ?? ""}`.trim();

  return (
    <div className={summaryGrid} aria-busy={isLoading}>
      <StatCard
        label={unitsLabel}
        value={data && formatCount(data.total_units)}
        loading={isLoading}
        icon={<Boxes />}
        trailing={formulaHint(unitsLabel, quantityFormulas[metric])}
      />
      <StatCard
        label={itemsLabel}
        value={data && formatCount(data.item_count)}
        loading={isLoading}
        icon={<Package />}
        trailing={formulaHint(itemsLabel, itemCountFormulas[metric])}
      />
      <StatCard
        label="Top item"
        value={<span className={topItemName}>{data?.top_item_name ?? "—"}</span>}
        loading={isLoading}
        hint={topHint}
        icon={<Trophy />}
        trailing={formulaHint("Top item", topItemFormula)}
        // Under Added the three tiles would leave the last phone row with one.
        className={sold ? undefined : summaryWideTile}
      />
      {sold && (
        <StatCard
          label="Stocked, not sold"
          value={data && formatCount(data.unsold_stocked_count)}
          loading={isLoading}
          icon={<PackageMinus />}
          tone={data && data.unsold_stocked_count > 0 ? "warning" : "neutral"}
          trailing={formulaHint("Stocked, not sold", unsoldStockedFormula)}
        />
      )}
    </div>
  );
};

export default AnalyzerSummaryCards;
