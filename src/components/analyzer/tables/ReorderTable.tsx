import DataTable from "../../common/table/DataTable";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { stockStatusLabels, stockStatusTones } from "../../../enums/inventory.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { reorderTableKey } from "../../../keys/table.keys";
import type { IReorderItem } from "../../../models/data/analyzer/analyzer.response";
import { formatCount } from "../../../utils/format.utils";
import { tableCellNumeric } from "../../../styles/table/table.styles";
import {
  analyzerCell,
  analyzerEndStack,
  analyzerHint,
  analyzerMeta,
  analyzerName,
  analyzerValue,
} from "../../../styles/analyzer/analyzer.styles";

type IProps = {
  rows: IReorderItem[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onOpen: (row: IReorderItem) => void;
};

const column = dataTableColumns<IReorderItem>();

const metaLine = (row: IReorderItem) =>
  [row.item_code, row.category_name].filter(Boolean).join(" · ");

const statusBadge = (row: IReorderItem) => (
  <StatusBadge tone={stockStatusTones[row.stock_status]} dot>
    {stockStatusLabels[row.stock_status]}
  </StatusBadge>
);

const ReorderTable = ({ rows, isLoading, isError, error, onRetry, onOpen }: IProps) => {
  const isMobile = useIsMobile();

  // A phone gets two columns: the item with its 30-day sales, and stock against the level.
  const mobileColumns = [
    column.display({
      id: "item",
      header: "Item",
      cell: ({ row }) => (
        <div className={analyzerCell}>
          <span className={analyzerName}>{row.original.name}</span>
          <span className={analyzerMeta}>
            {formatCount(row.original.sold_30d)} sold in 30 days
          </span>
        </div>
      ),
    }),
    column.display({
      id: "stock",
      header: () => <span className={tableCellNumeric}>Stock</span>,
      cell: ({ row }) => (
        <div className={analyzerEndStack}>
          <span className={analyzerValue}>
            {row.original.on_hand}{" "}
            <span className={analyzerHint}>/ {row.original.reorder_level}</span>
          </span>
          {statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
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
      id: "on_hand",
      header: () => <span className={tableCellNumeric}>On hand</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>
          <span className={analyzerValue}>{row.original.on_hand}</span>{" "}
          <span className={analyzerHint}>{row.original.unit}</span>
        </div>
      ),
    }),
    column.display({
      id: "reorder_level",
      header: () => <span className={tableCellNumeric}>Reorder at</span>,
      cell: ({ row }) => <div className={tableCellNumeric}>{row.original.reorder_level}</div>,
    }),
    column.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original),
    }),
    column.display({
      id: "sold_30d",
      header: () => <span className={tableCellNumeric}>Sold (30 days)</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>{formatCount(row.original.sold_30d)}</div>
      ),
    }),
  ];

  return (
    <DataTable
      tableKey={reorderTableKey}
      label="Items that need reordering"
      data={rows}
      columns={isMobile ? mobileColumns : desktopColumns}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText="Nothing to reorder. Every item is above its threshold."
      loadingText="Loading reorder list…"
      onRowClick={onOpen}
    />
  );
};

export default ReorderTable;
