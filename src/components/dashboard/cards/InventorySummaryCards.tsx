import { Boxes, Layers, PackageX, TriangleAlert } from "lucide-react";
import { useInventorySummary } from "../../../hook/data/inventory/inventory.list.hook";
import { summaryGrid } from "../../../styles/dashboard/dashboard.styles";
import { formatNumber } from "../../../utils/format.utils";
import StatCard from "../../common/card/StatCard";
import ErrorState from "../../common/status/ErrorState";

const loadingValue = "—";

// Counts come from inventory_summary, the same rule the inventory status tabs use.
const InventorySummaryCards = () => {
  const summary = useInventorySummary();

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
  }

  const data = summary.data;
  const value = (count: number | undefined) =>
    count === undefined ? loadingValue : formatNumber(count);

  return (
    <div className={summaryGrid}>
      <StatCard label="Items tracked" value={value(data?.item_count)} icon={<Boxes />} tone="brand" />
      <StatCard label="Units on hand" value={value(data?.units_on_hand)} icon={<Layers />} tone="info" />
      <StatCard
        label="Low stock"
        value={value(data?.low_count)}
        hint="At or below its warning quantity"
        icon={<TriangleAlert />}
        tone="warning"
      />
      <StatCard
        label="Out of stock"
        value={value(data?.out_count)}
        hint="Nothing left on the shelf"
        icon={<PackageX />}
        tone="danger"
      />
    </div>
  );
};

export default InventorySummaryCards;
