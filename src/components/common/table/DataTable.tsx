import type { ReactNode } from "react";
import { Fragment } from "react";
import type { RowData } from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import { useRowExpansion } from "../../../hook/common/expansion.hook";
import {
  dataTableFeatures,
  type IDataTableColumn,
} from "./dataTable.config";
import {
  dataCardTray,
  dataTableCell,
  dataTableCellEnds,
  dataTableCellExpanded,
  dataTableGrid,
  dataTableHead,
  dataTableHeader,
  dataTableRow,
  dataTableTray,
  tableColumnHidden,
  tableExpansionCell,
  tableExpansionInner,
  tableLoadingAnnounce,
  tableRowClickable,
  tableSkeletonBar,
  tableStateCell,
} from "../../../styles/table/table.styles";
import {
  listGroupItem,
  listSkeletonBar,
  listSkeletonRow,
} from "../../../styles/list/list.styles";
import ListGroup from "../list/ListGroup";
import ErrorState from "../status/ErrorState";
import StateBox from "../status/StateBox";

const SKELETON_ROWS = 5;

type IColumnLike = { columnDef: { meta?: { hideBelow?: "lg" | "xl" } } };

const columnHidden = (column: IColumnLike) =>
  tableColumnHidden({ below: column.columnDef.meta?.hideBelow });

type IProps<TData extends RowData> = {
  // Stable key for the row-expansion store; use the keys in keys/table.keys.ts.
  tableKey: string;
  // Accessible name; the aria table is a grid and needs one.
  label: string;
  data: TData[];
  columns: IDataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyText?: string;
  loadingText?: string;
  onRowClick?: (row: TData) => void;
  // Renders an expanded panel under the row; enables row expansion when given.
  renderExpanded?: (row: TData) => ReactNode;
  // Phones get one ListRow per row inside a single ListGroup instead of the grid.
  renderRow?: (row: TData) => ReactNode;
  className?: string;
};

const DataTable = <TData extends RowData>({
  tableKey,
  label,
  data,
  columns,
  getRowId,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyText = "Nothing to show yet.",
  loadingText = "Loading…",
  onRowClick,
  renderExpanded,
  renderRow,
  className,
}: IProps<TData>) => {
  const { expandedRow, toggleRow } = useRowExpansion(tableKey);
  const isMobile = useIsMobile();

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
  });

  // The aria table takes its columns straight under the header, one row of
  // them, so only the leaf level is rendered. No Moti table groups columns.
  const headerGroups = table.getHeaderGroups();
  const leafHeaders = headerGroups[headerGroups.length - 1]?.headers ?? [];
  const leafColumns = table.getAllLeafColumns();
  const columnCount = leafColumns.length;

  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`} className={dataTableRow}>
          {leafColumns.map((column) => (
            <TableCell
              key={column.id}
              className={cn(dataTableCell, dataTableCellEnds, columnHidden(column))}
            >
              <Skeleton className={tableSkeletonBar} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell
            colSpan={columnCount}
            className={cn(dataTableCell, tableStateCell)}
          >
            <ErrorState error={error} onRetry={onRetry} />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={columnCount}
            className={cn(dataTableCell, tableStateCell)}
          >
            <StateBox>{emptyText}</StateBox>
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => {
      const expanded = renderExpanded !== undefined && expandedRow === row.id;
      const clickable = Boolean(onRowClick) || renderExpanded !== undefined;

      return (
        <Fragment key={row.id}>
          <TableRow
            className={cn(dataTableRow, clickable && tableRowClickable)}
            // onAction covers click, tap and Enter; left off, the row is inert.
            onAction={
              clickable
                ? () => {
                    if (renderExpanded) toggleRow(row.id);
                    onRowClick?.(row.original);
                  }
                : undefined
            }
          >
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  dataTableCell,
                  expanded ? dataTableCellExpanded : dataTableCellEnds,
                  columnHidden(cell.column),
                )}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>

          {expanded && (
            <TableRow>
              <TableCell colSpan={columnCount} className={tableExpansionCell}>
                <div className={tableExpansionInner}>
                  {renderExpanded(row.original)}
                </div>
              </TableCell>
            </TableRow>
          )}
        </Fragment>
      );
    });
  };

  if (isMobile && renderRow) {
    const renderList = () => {
      if (isLoading) {
        return (
          <ListGroup label={label} busy>
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <li key={`skeleton-${index}`} className={listSkeletonRow}>
                <Skeleton className={listSkeletonBar} />
              </li>
            ))}
          </ListGroup>
        );
      }
      if (isError) return <ErrorState error={error} onRetry={onRetry} />;
      if (data.length === 0) return <StateBox>{emptyText}</StateBox>;

      return (
        <ListGroup label={label}>
          {data.map((row) => (
            <li key={getRowId(row)} className={listGroupItem}>
              {renderRow(row)}
            </li>
          ))}
        </ListGroup>
      );
    };

    return (
      <div className={cn(dataCardTray, className)}>
        {renderList()}
        {isLoading && (
          <p role="status" className={tableLoadingAnnounce}>
            {loadingText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn(dataTableTray, className)}>
      <Table aria-label={label} className={dataTableGrid}>
        <TableHeader className={dataTableHeader}>
          {leafHeaders.map((header, index) => (
            <TableHead
              key={header.id}
              isRowHeader={index === 0}
              className={cn(dataTableHead, columnHidden(header.column))}
            >
              {header.isPlaceholder ? null : (
                <table.FlexRender header={header} />
              )}
            </TableHead>
          ))}
        </TableHeader>

        <TableBody aria-busy={isLoading}>{renderBody()}</TableBody>
      </Table>

      {isLoading && (
        <p role="status" className={tableLoadingAnnounce}>
          {loadingText}
        </p>
      )}
    </div>
  );
};

export default DataTable;
