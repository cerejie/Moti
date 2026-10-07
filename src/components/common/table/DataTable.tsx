import { useId, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { usePagination } from "../../../hook/common/pagination.hook";
import {
  grownPageSize,
  type IPaginationRequest,
} from "../../../models/common/pagination.model";
import { rowDetailSheetModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import {
  dataTableCell,
  dataTableCollapse,
  dataTableGrid,
  dataTableHead,
  dataTableHeader,
  dataTableLoadingAnnounce,
  dataTableRefreshSpinner,
  dataTableRoot,
  dataTableRow,
  dataTableRowClickable,
  dataTableRowStatic,
  dataTableSkeletonBar,
  dataTableStaleNotice,
  dataTableStaleRows,
  dataTableStateCell,
} from "../../../styles/table/table.styles";
import AppAlert from "../status/AppAlert";
import ErrorState from "../status/ErrorState";
import DataTableList from "./DataTableList";
import LoadMoreSentinel from "./LoadMoreSentinel";
import TableEmptyState from "./TableEmptyState";
import TablePagination from "./TablePagination";

const skeletonRows = 5;

type IProps<T> = {
  columns: readonly IDataTableColumn<T>[];
  data: readonly T[];
  // Accessible name; the aria table is a grid and needs one.
  label?: string;
  loading?: boolean;
  // Rows are on screen while a newer page, size or filter loads.
  refreshing?: boolean;
  error?: unknown;
  onRetry?: () => void;
  // The rows belong to an earlier search, filter or page that cannot be refreshed now.
  isStale?: boolean;
  rowKey?: keyof T | ((row: T) => string);
  // Client-side page size, used only when the data is not server-paged.
  pageSize?: number;
  // Server paging: wide screens get the pager, compact grows the page as it scrolls.
  pagination?: IPaginationRequest;
  totalCount?: number;
  onPageChange?: (pageNumber: number, pageSize: number) => void;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  emptyHint?: string;
  // Compact rows: metas shown before the rest move into RecordDetailSheet.
  cardMetaLimit?: number;
  detailSections?: IDetailSection<T>[];
  detailTitle?: (row: T) => string;
  // Given, the row's actions leave the compact row for the detail sheet's footer.
  detailActions?: (row: T) => readonly IRowAction[];
};

const toCellContent = (value: unknown): ReactNode =>
  typeof value === "string" || typeof value === "number" ? value : null;

const columnId = <T,>(column: IDataTableColumn<T>, index: number) =>
  column.key ?? column.dataIndex ?? String(index);

const DataTable = <T extends object>({
  columns,
  data,
  label = "Records",
  loading = false,
  refreshing = false,
  error,
  onRetry,
  isStale = false,
  rowKey = "id" as keyof T,
  pageSize = 8,
  pagination,
  totalCount = 0,
  onPageChange,
  onRowClick,
  emptyText = "Nothing to show yet.",
  emptyHint,
  cardMetaLimit,
  detailSections,
  detailTitle,
  detailActions,
}: IProps<T>) => {
  const tableId = useId();
  const isCompact = useIsCompact();
  const { pagination: clientPagination, setPagination: setClientPagination } =
    usePagination(tableId);

  const resolveRowKey =
    typeof rowKey === "function" ? rowKey : (row: T) => String(row[rowKey]);

  const clientLastPage = Math.max(1, Math.ceil(data.length / pageSize));
  const clientPage = Math.min(clientPagination.pageNumber, clientLastPage);
  const firstClientRow = isCompact ? 0 : (clientPage - 1) * pageSize;
  const rows = pagination ? data : data.slice(firstClientRow, clientPage * pageSize);

  const failed = Boolean(error);
  const showStale = isStale && !loading && !failed && rows.length > 0;

  const renderContent = (column: IDataTableColumn<T>, row: T, rowIndex: number) => {
    const value = column.dataIndex ? row[column.dataIndex] : undefined;
    return column.render ? column.render(value, row, rowIndex) : toCellContent(value);
  };

  const renderRow = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);

    return (
      <TableRow
        key={key}
        id={key}
        className={cn(dataTableRow, onRowClick && dataTableRowClickable)}
        // onAction covers click, tap and Enter; left off, the row is inert.
        onAction={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((column, index) => (
          <TableCell
            key={columnId(column, index)}
            className={cn(
              dataTableCell({ align: column.align }),
              dataTableCollapse({ collapse: column.collapse }),
              column.className,
            )}
          >
            {renderContent(column, row, rowIndex)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: skeletonRows }, (_, rowIndex) => (
        <TableRow
          key={`skeleton-${rowIndex}`}
          id={`skeleton-${rowIndex}`}
          className={cn(dataTableRow, dataTableRowStatic)}
        >
          {columns.map((column, cellIndex) => (
            <TableCell
              key={columnId(column, cellIndex)}
              className={cn(
                dataTableCell({ align: column.align }),
                dataTableCollapse({ collapse: column.collapse }),
              )}
            >
              <Skeleton className={dataTableSkeletonBar({ align: column.align })} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (failed && rows.length === 0) {
      return (
        <TableRow key="error" id="error" className={cn(dataTableRow, dataTableRowStatic)}>
          <TableCell colSpan={columns.length} className={dataTableStateCell}>
            <ErrorState error={error} onRetry={onRetry} />
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow key="empty" id="empty" className={cn(dataTableRow, dataTableRowStatic)}>
          <TableCell colSpan={columns.length} className={dataTableStateCell}>
            <TableEmptyState text={emptyText} hint={emptyHint} />
          </TableCell>
        </TableRow>
      );
    }

    return rows.map(renderRow);
  };

  const renderTable = () => (
    <Table aria-label={label} className={dataTableGrid}>
      <TableHeader className={dataTableHeader}>
        {columns.map((column, index) => (
          <TableHead
            key={columnId(column, index)}
            id={columnId(column, index)}
            isRowHeader={index === 0}
            className={cn(
              dataTableHead({ align: column.align }),
              dataTableCollapse({ collapse: column.collapse }),
            )}
          >
            {column.title}
            {refreshing && index === columns.length - 1 ? (
              <Spinner className={dataTableRefreshSpinner} />
            ) : null}
          </TableHead>
        ))}
      </TableHeader>

      <TableBody aria-busy={loading || refreshing} className={cn(showStale && dataTableStaleRows)}>
        {renderBody()}
      </TableBody>
    </Table>
  );

  return (
    <div className={dataTableRoot}>
      {showStale ? (
        <AppAlert
          tone="warning"
          status
          icon={<WifiOff />}
          title="You're offline — this is the last list loaded, not your new search or filter."
          className={dataTableStaleNotice}
        />
      ) : null}

      {isCompact ? (
        <DataTableList<T>
          columns={columns}
          rows={rows}
          label={label}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={onRetry}
          emptyText={emptyText}
          emptyHint={emptyHint}
          resolveRowKey={resolveRowKey}
          renderContent={renderContent}
          columnId={columnId}
          onRowClick={onRowClick}
          className={cn(showStale && dataTableStaleRows)}
          cardMetaLimit={cardMetaLimit}
          detailSheetKey={rowDetailSheetModalKey(tableId)}
          detailSections={detailSections}
          detailTitle={detailTitle}
          detailActions={detailActions}
        />
      ) : (
        renderTable()
      )}

      {loading || refreshing ? (
        <p role="status" className={dataTableLoadingAnnounce}>
          {loading ? "Loading" : "Refreshing"}
        </p>
      ) : null}

      {isCompact && pagination && onPageChange && !loading && rows.length > 0 ? (
        <LoadMoreSentinel
          loadedCount={rows.length}
          totalCount={totalCount}
          loading={refreshing}
          failed={failed || isStale}
          onRetry={onRetry}
          onLoadMore={() => onPageChange(1, grownPageSize(pagination))}
        />
      ) : null}

      {!isCompact && pagination && onPageChange ? (
        <TablePagination
          pagination={pagination}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      ) : null}

      {isCompact && !pagination && !loading && data.length > pageSize ? (
        <LoadMoreSentinel
          loadedCount={rows.length}
          totalCount={data.length}
          loading={false}
          onLoadMore={() => setClientPagination({ pageNumber: clientPage + 1 })}
        />
      ) : null}

      {!isCompact && !pagination && data.length > pageSize ? (
        <TablePagination
          pagination={{ pageNumber: clientPage, pageSize }}
          totalCount={data.length}
          onPageChange={(pageNumber) => setClientPagination({ pageNumber })}
          showSizeChanger={false}
        />
      ) : null}
    </div>
  );
};

export default DataTable;
