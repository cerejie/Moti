import { Boxes, Layers, PackageX, TriangleAlert } from "lucide-react";
import { useInventorySummary } from "../../../hook/data/inventory/inventory.list.hook";
import { summaryGrid } from "../../../styles/dashboard/dashboard.styles";
import { formatNumber } from "../../../utils/format.utils";
import StatCard from "../../common/card/StatCard";

// Counts come from inventory_summary, the same rule the inventory status tabs use.
const InventorySummaryCards = () => {
  const summary = useInventorySummary();

  const data = summary.data;
  // Each tile carries the error so the grid keeps its shape.
  const state = {
    loading: summary.isLoading,
    error: summary.error,
    onRetry: () => void summary.refetch(),
  };
  const count = (value: number | undefined) =>
    value === undefined ? undefined : formatNumber(value);

  return (
    <div className={summaryGrid}>
      <StatCard
        title="Items tracked"
        value={count(data?.item_count)}
        raw
        {...state}
        icon={<Boxes />}
        variant="brand"
      />
      <StatCard
        title="Units on hand"
        value={count(data?.units_on_hand)}
        raw
        {...state}
        icon={<Layers />}
        variant="info"
      />
      <StatCard
        title="Low stock"
        value={count(data?.low_count)}
        raw
        {...state}
        caption="At or below its warning quantity"
        icon={<TriangleAlert />}
        variant="warning"
      />
      <StatCard
        title="Out of stock"
        value={count(data?.out_count)}
        raw
        {...state}
        caption="Nothing left on the shelf"
        icon={<PackageX />}
        variant="danger"
      />
    </div>
  );
};

export default InventorySummaryCards;
