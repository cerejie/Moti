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
import { cn } from "@/utils/cn.utils";
import { useRowExpansion } from "../../../hook/common/expansion.hook";
import {
  dataTableFeatures,
  type IDataTableColumn,
} from "./dataTable.config";
import {
  dataTableCell,
  dataTableCellEnds,
  dataTableCellExpanded,
  dataTableGrid,
  dataTableHead,
  dataTableHeader,
  dataTableRow,
  dataTableTray,
  tableExpansionCell,
  tableExpansionInner,
  tableLoadingAnnounce,
  tableRowClickable,
  tableSkeletonBar,
  tableStateCell,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import StateBox from "../status/StateBox";

const SKELETON_ROWS = 5;

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
  className,
}: IProps<TData>) => {
  const { expandedRow, toggleRow } = useRowExpansion(tableKey);

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
  const columnCount = table.getAllLeafColumns().length;

  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`} className={dataTableRow}>
          {Array.from({ length: columnCount }).map((__, cellIndex) => (
            <TableCell
              key={cellIndex}
              className={cn(dataTableCell, dataTableCellEnds)}
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

  return (
    <div className={cn(dataTableTray, className)}>
      <Table aria-label={label} className={dataTableGrid}>
        <TableHeader className={dataTableHeader}>
          {leafHeaders.map((header, index) => (
            <TableHead
              key={header.id}
              isRowHeader={index === 0}
              className={dataTableHead}
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
