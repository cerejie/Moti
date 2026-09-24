import DataTable from "../../common/table/DataTable";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { stockStatusLabels, stockStatusTones } from "../../../enums/inventory.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import { stockAlertTableKey } from "../../../keys/table.keys";
import type { IStockAlert } from "../../../models/data/dashboard/dashboard.response";
import { tableCellNumeric } from "../../../styles/table/table.styles";
import {
  alertCell,
  alertMeta,
  alertName,
  alertStockHint,
  alertStockStack,
  alertStockValue,
} from "../../../styles/dashboard/dashboard.styles";

type IProps = {
  alerts: IStockAlert[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onOpen: (alert: IStockAlert) => void;
};

const column = dataTableColumns<IStockAlert>();

const metaLine = (alert: IStockAlert) =>
  [alert.sku, alert.category_name].filter(Boolean).join(" · ");

// Items at or near their reorder level, most urgent first. Shared by the
// dashboard card and the alerts sheet.
const StockAlertTable = ({ alerts, isLoading, isError, error, onRetry, onOpen }: IProps) => {
  const isMobile = useIsMobile();

  const itemColumn = column.display({
    id: "item",
    header: "Item",
    cell: ({ row }) => (
      <div className={alertCell}>
        <span className={alertName}>{row.original.name}</span>
        <span className={alertMeta}>{metaLine(row.original)}</span>
      </div>
    ),
  });

  const statusBadge = (alert: IStockAlert) => (
    <StatusBadge tone={stockStatusTones[alert.stock_status]} dot>
      {stockStatusLabels[alert.stock_status]}
    </StatusBadge>
  );

  // A phone gets two columns: the item, and its stock against the reorder level with status.
  const mobileColumns = [
    itemColumn,
    column.display({
      id: "stock",
      header: () => <span className={tableCellNumeric}>Stock</span>,
      cell: ({ row }) => (
        <div className={alertStockStack}>
          <span className={alertStockValue}>
            {row.original.on_hand}{" "}
            <span className={alertStockHint}>/ {row.original.reorder_level}</span>
          </span>
          {statusBadge(row.original)}
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    itemColumn,
    column.display({
      id: "on_hand",
      header: () => <span className={tableCellNumeric}>On hand</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>
          <span className={alertStockValue}>{row.original.on_hand}</span>{" "}
          <span className={alertStockHint}>{row.original.unit}</span>
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
  ];

  return (
    <DataTable
      tableKey={stockAlertTableKey}
      label="Items that need attention"
      data={alerts}
      columns={isMobile ? mobileColumns : desktopColumns}
      getRowId={(alert) => alert.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText="Nothing needs attention. Every item is in stock."
      loadingText="Loading alerts…"
      onRowClick={onOpen}
    />
  );
};

export default StockAlertTable;
