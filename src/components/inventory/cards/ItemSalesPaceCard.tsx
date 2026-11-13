import {
  analysisCoverDays,
  analysisMinSales,
  analysisPeriodLabels,
  defaultAnalysisPeriod,
} from "../../../enums/analyzer.enum";
import { useItemSalesPace } from "../../../hook/data/analyzer/analyzer.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import { detailPageSurface } from "../../../styles/view/detailPage.styles";
import {
  formatCount,
  formatDaysLeft,
  formatNumber,
  formatPace,
  formatShortDate,
} from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";

type IProps = {
  itemId: string;
};

const notEnough = `Not enough sales yet (under ${analysisMinSales})`;

const daysLeftText = (row: IStockAnalysisRow) => {
  if (row.on_hand === 0) return "Out of stock";
  return row.days_left === null ? "—" : formatDaysLeft(row.days_left);
};

const paceItems: IDetailItem<IStockAnalysisRow>[] = [
  {
    key: "sold",
    label: `Sold in ${analysisPeriodLabels[defaultAnalysisPeriod]}`,
    render: (row) =>
      `${formatNumber(row.sold_units)} ${row.unit} in ${formatCount(row.sale_count, "sale")}`,
  },
  {
    key: "pace",
    label: "Pace",
    render: (row) => (row.pace === null ? notEnough : formatPace(row.pace)),
  },
  { key: "daysLeft", label: "Days left", render: daysLeftText },
  {
    key: "suggested",
    label: `To order (${analysisCoverDays} days)`,
    render: (row) =>
      row.suggested_quantity === null ? "—" : `${formatNumber(row.suggested_quantity)} ${row.unit}`,
  },
  {
    key: "lastSold",
    label: "Last sold",
    render: (row) => (row.last_sold_at ? formatShortDate(row.last_sold_at) : "Never"),
  },
];

const ItemSalesPaceCard = ({ itemId }: IProps) => {
  const pace = useItemSalesPace(itemId, true);

  if (pace.isLoading) return <EmptyState compact loading description="Working out the pace…" />;
  if (pace.isError) {
    return <ErrorState compact error={pace.error} onRetry={() => void pace.refetch()} />;
  }
  // Archived items are left out of the analysis.
  if (!pace.data) return <EmptyState compact description="No sales pace for this item." />;

  return (
    <div className={detailPageSurface}>
      <DetailRows record={pace.data} items={paceItems} />
    </div>
  );
};

export default ItemSalesPaceCard;
