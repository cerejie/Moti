import DataTable from "../../common/table/DataTable";
import { dataTableColumns } from "../../common/table/dataTable.config";
import StatusBadge from "../../common/status/StatusBadge";
import { movementReasonLabels, movementReasonTones } from "../../../enums/movement.enum";
import { useIsMobile } from "../../../hook/use-mobile";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { formatDateTime, formatSignedQuantity } from "../../../utils/format.utils";
import { tableCellNumeric } from "../../../styles/table/table.styles";
import {
  movementBalance,
  movementCell,
  movementMeta,
  movementNote,
  movementQuantity,
  movementQuantityStack,
  movementTitle,
} from "../../../styles/movement/movement.styles";

type IProps = {
  tableKey: string;
  movements: IStockMovement[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  // The shop-wide page names the item on each row; an item's own history doesn't.
  showItem: boolean;
  onOpenItem?: (movement: IStockMovement) => void;
  emptyText: string;
};

const column = dataTableColumns<IStockMovement>();

const reasonBadge = (movement: IStockMovement) => (
  <StatusBadge tone={movementReasonTones[movement.reason]}>
    {movementReasonLabels[movement.reason]}
  </StatusBadge>
);

const quantityText = (movement: IStockMovement) => (
  <span
    className={movementQuantity({
      direction: movement.movement_type === "stock_in" ? "in" : "out",
    })}
  >
    {formatSignedQuantity(movement.quantity)}
  </span>
);

const MovementTable = ({
  tableKey,
  movements,
  isLoading,
  isError,
  error,
  onRetry,
  showItem,
  onOpenItem,
  emptyText,
}: IProps) => {
  const isMobile = useIsMobile();

  const itemColumn = column.display({
    id: "item",
    header: "Item",
    cell: ({ row }) => (
      <div className={movementCell}>
        <span className={movementTitle}>{row.original.item_name}</span>
        <span className={movementMeta}>SKU {row.original.item_sku}</span>
      </div>
    ),
  });

  // A phone gets two columns: what happened and when, then the quantity and balance.
  const mobileColumns = [
    column.display({
      id: "movement",
      header: showItem ? "Item" : "Movement",
      cell: ({ row }) => {
        const movement = row.original;
        const meta = [
          showItem ? movementReasonLabels[movement.reason] : null,
          formatDateTime(movement.occurred_at),
          movement.created_by_name,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div className={movementCell}>
            {showItem ? (
              <span className={movementTitle}>{movement.item_name}</span>
            ) : (
              <span>{reasonBadge(movement)}</span>
            )}
            <span className={movementMeta}>{meta}</span>
            {movement.note && <span className={movementNote}>{movement.note}</span>}
          </div>
        );
      },
    }),
    column.display({
      id: "quantity",
      header: () => <span className={tableCellNumeric}>Qty</span>,
      cell: ({ row }) => (
        <div className={movementQuantityStack}>
          {quantityText(row.original)}
          <span className={movementBalance}>
            Bal. {row.original.balance_after} {row.original.item_unit}
          </span>
        </div>
      ),
    }),
  ];

  const desktopColumns = [
    column.display({
      id: "occurred_at",
      header: "When",
      cell: ({ row }) => formatDateTime(row.original.occurred_at),
    }),
    ...(showItem ? [itemColumn] : []),
    column.display({
      id: "reason",
      header: "Reason",
      cell: ({ row }) => reasonBadge(row.original),
    }),
    column.display({
      id: "quantity",
      header: () => <span className={tableCellNumeric}>Qty</span>,
      cell: ({ row }) => <div className={tableCellNumeric}>{quantityText(row.original)}</div>,
    }),
    column.display({
      id: "balance_after",
      header: () => <span className={tableCellNumeric}>Balance</span>,
      cell: ({ row }) => (
        <div className={tableCellNumeric}>
          {row.original.balance_after} {row.original.item_unit}
        </div>
      ),
    }),
    column.display({
      id: "created_by",
      header: "By",
      cell: ({ row }) => row.original.created_by_name ?? "—",
    }),
    column.display({
      id: "note",
      header: "Note",
      cell: ({ row }) => <span className={movementNote}>{row.original.note ?? "—"}</span>,
    }),
  ];

  return (
    <DataTable
      tableKey={tableKey}
      label={showItem ? "Stock movements" : "Item stock movements"}
      data={movements}
      columns={isMobile ? mobileColumns : desktopColumns}
      getRowId={(movement) => movement.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      emptyText={emptyText}
      loadingText="Loading movements…"
      onRowClick={onOpenItem}
    />
  );
};

export default MovementTable;
