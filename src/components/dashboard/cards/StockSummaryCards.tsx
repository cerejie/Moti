import type { ReactNode } from "react";
import {
  Boxes,
  ChevronRight,
  Package,
  PackageOpen,
  PackageX,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import AppButton from "../../common/button/AppButton";
import StatCard from "../../common/card/StatCard";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import {
  stockStatusLabels,
  stockStatusTones,
  type StockStatus,
} from "../../../enums/inventory.enum";
import { useOpenStockStatus, useStockSummary } from "../../../hook/data/dashboard/dashboard.list.hook";
import type { IStockSummary } from "../../../models/data/dashboard/dashboard.response";
import { ROUTES } from "../../../routes/route.paths";
import { formatCount } from "../../../utils/format.utils";
import { summaryGrid, summaryWideTile } from "../../../styles/dashboard/dashboard.styles";

type IStatusTile = {
  status: Exclude<StockStatus, "in_stock">;
  count: (summary: IStockSummary) => number;
  icon: ReactNode;
  wide?: boolean;
};

// Most urgent first, the same order as the alerts.
const statusTiles: IStatusTile[] = [
  { status: "out_of_stock", count: (s) => s.out_of_stock_count, icon: <PackageX /> },
  { status: "reorder", count: (s) => s.reorder_count, icon: <TriangleAlert /> },
  { status: "low", count: (s) => s.low_count, icon: <TrendingDown />, wide: true },
];

const StockSummaryCards = () => {
  const { data, isLoading, isError, error, refetch } = useStockSummary();
  const openStatus = useOpenStockStatus();

  if (isLoading) return <StateBox loading title="Loading stock summary…" />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (data.item_count === 0) {
    return (
      <StateBox
        icon={<PackageOpen />}
        title="No items yet"
        action={<AppButton href={ROUTES.inventory}>Open inventory</AppButton>}
      >
        Add items to your inventory and their stock levels show up here.
      </StateBox>
    );
  }

  return (
    <div className={summaryGrid}>
      <StatCard
        label="Items"
        value={formatCount(data.item_count)}
        icon={<Package />}
        trailing={<ChevronRight />}
        to={ROUTES.inventory}
        onPress={() => openStatus("all")}
      />
      <StatCard label="Units on hand" value={formatCount(data.units_on_hand)} icon={<Boxes />} />
      {statusTiles.map((tile) => {
        const count = tile.count(data);
        return (
          <StatCard
            key={tile.status}
            label={stockStatusLabels[tile.status]}
            value={formatCount(count)}
            icon={tile.icon}
            // A zero stays quiet; only a status with items carries its colour.
            tone={count > 0 ? stockStatusTones[tile.status] : "neutral"}
            trailing={<ChevronRight />}
            to={ROUTES.inventory}
            onPress={() => openStatus(tile.status)}
            className={tile.wide ? summaryWideTile : undefined}
          />
        );
      })}
    </div>
  );
};

export default StockSummaryCards;
