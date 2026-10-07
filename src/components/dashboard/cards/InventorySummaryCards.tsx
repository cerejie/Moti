import { Boxes, Layers, PackageX, TriangleAlert } from "lucide-react";
import { useInventorySummary } from "../../../hook/data/inventory/inventory.list.hook";
import { summaryGrid } from "../../../styles/dashboard/dashboard.styles";
import { formatNumber } from "../../../utils/format.utils";
import StatCard from "../../common/card/StatCard";
import ErrorState from "../../common/status/ErrorState";

// Counts come from inventory_summary, the same rule the inventory status tabs use.
const InventorySummaryCards = () => {
  const summary = useInventorySummary();

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
  }

  const data = summary.data;
  const loading = summary.isLoading;
  const count = (value: number | undefined) =>
    value === undefined ? undefined : formatNumber(value);

  return (
    <div className={summaryGrid}>
      <StatCard
        title="Items tracked"
        value={count(data?.item_count)}
        raw
        loading={loading}
        icon={<Boxes />}
        variant="brand"
      />
      <StatCard
        title="Units on hand"
        value={count(data?.units_on_hand)}
        raw
        loading={loading}
        icon={<Layers />}
        variant="info"
      />
      <StatCard
        title="Low stock"
        value={count(data?.low_count)}
        raw
        loading={loading}
        caption="At or below its warning quantity"
        icon={<TriangleAlert />}
        variant="warning"
      />
      <StatCard
        title="Out of stock"
        value={count(data?.out_count)}
        raw
        loading={loading}
        caption="Nothing left on the shelf"
        icon={<PackageX />}
        variant="danger"
      />
    </div>
  );
};

export default InventorySummaryCards;
