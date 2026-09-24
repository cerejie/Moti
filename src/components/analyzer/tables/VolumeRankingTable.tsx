import DataTable from "../../common/table/DataTable";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { analyzerMetricLabels, type AnalyzerMetric } from "../../../enums/analyzer.enum";
import { stockStatusLabels, stockStatusTones } from "../../../enums/inventory.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { analyzerTableKey } from "../../../keys/table.keys";
import type { IVolumeRank } from "../../../models/data/analyzer/analyzer.response";
import { formatCount } from "../../../utils/format.utils";
import { tableCellNumeric } from "../../../styles/table/table.styles";
import {
  analyzerCell,
  analyzerEndStack,
  analyzerHint,
  analyzerMeta,
  analyzerName,
  analyzerValue,
  rankValue,
} from "../../../styles/analyzer/analyzer.styles";

type IProps = {
  rows: IVolumeRank[];
  metric: AnalyzerMetric;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onOpen: (row: IVolumeRank) => void;
};

const column = dataTableColumns<IVolumeRank>();

const metaLine = (row: IVolumeRank) =>
  [row.sku, row.category_name].filter(Boolean).join(" · ");

const countLabel = (count: number, metric: AnalyzerMetric) => {
  const noun = metric === "sold" ? "sale" : "stock-in";
  return `${formatCount(count)} ${noun}${count === 1 ? "" : "s"}`;
};

const statusBadge = (row: IVolumeRank) => (
  <StatusBadge tone={stockStatusTones[row.stock_status]} dot>
    {stockStatusLabels[row.stock_status]}
  </StatusBadge>
);

const quantityValue = (row: IVolumeRank) => (
  <span className={analyzerValue}>
    {formatCount(row.quantity)} <span className={analyzerHint}>{row.unit}</span>
  </span>
);

const VolumeRankingTable = ({
  rows,
  metric,
  isLoading,
  isError,
  error,
  onRetry,
  onOpen,
}: IProps) => {
  const isMobile = useIsMobile();

  const rankColumn = column.display({
    id: "rank",
    header: "#",
    cell: ({ row }) => <span className={rankValue}>{row.original.rank}</span>,
  });

  const quantityHeader = () => (
    <span className={tableCellNumeric}>{analyzerMetricLabels[metric]}</span>
  );

  // A phone gets three columns: rank, the item with its count, and the quantity with status.
  const mobileColumns = [
    rankColumn,
    column.display({
      id: "item",
      header: "Item",
      cell: ({ row }) => (
        <div className={analyzerCell}>
          <span className={analyzerName}>{row.original.name}</span>
          <span className={analyzerMeta}>
            {countLabel(row.original.transaction_count, metric)}
          </span>
        </div>
      ),
    }),
    column.display({
      id: "quantity",
      header: quantityHeader,
      cell: ({ row }) => (
        <div className={analyzerEndStack}>
          {quantityValue(row.original)}
          {statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    rankColumn,
    column.display({
      id: "item",
      header: "Item",
      cell: ({ row }) => (
        <div className={analyzerCell}>
          <span className={analyzerName}>{row.original.name}</span>
          <span className={analyzerMeta}>{metaLine(row.original)}</span>
        </div>
      ),
    }),
    column.display({
      id: "quantity",
      header: quantityHeader,
      cell: ({ row }) => <div className={tableCellNumeric}>{quantityValue(row.original)}</div>,
    }),
    column.display({
      id: "transactions",
      header: () => <span className={tableCellNumeric}>Transactions</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>{formatCount(row.original.transaction_count)}</div>
      ),
    }),
    column.display({
      id: "on_hand",
      header: () => <span className={tableCellNumeric}>On hand</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>{formatCount(row.original.on_hand)}</div>
      ),
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
  ];

  return (
    <DataTable
      tableKey={analyzerTableKey}
      label="Items ranked by volume"
      data={rows}
      columns={isMobile ? mobileColumns : desktopColumns}
      getRowId={(row) => row.item_id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={
        metric === "sold"
          ? "No sales in this period for these filters."
          : "No stock was added in this period for these filters."
      }
      loadingText="Loading ranking…"
      onRowClick={onOpen}
    />
  );
};

export default VolumeRankingTable;
