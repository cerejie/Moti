import { Fragment, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button as PressArea } from "react-aria-components";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import type {
  ICardField,
  ICardFields,
  IColumnMobileRole,
  IDataTableColumn,
} from "../../../models/common/table.model";
import {
  dataList,
  dataListAmount,
  dataListChevron,
  dataListFrame,
  dataListMain,
  dataListRaised,
  dataListRow,
  dataListSecondary,
  dataListSecondaryItem,
  dataListSeparator,
  dataListSkeletonAmount,
  dataListSkeletonMain,
  dataListSkeletonMeta,
  dataListSkeletonTitle,
  dataListTags,
  dataListTitle,
  dataListTitlePress,
  dataListTrail,
} from "../../../styles/table/table.styles";
import ErrorState from "../status/ErrorState";
import TableEmptyState from "./TableEmptyState";

const skeletonRows = 5;
const emptyMark = "—";
const secondarySeparator = "·";

const isEmptyContent = (content: ReactNode) =>
  content === null || content === undefined || content === "" || content === emptyMark;

type IProps<T> = {
  columns: readonly IDataTableColumn<T>[];
  rows: readonly T[];
  label: string;
  loading?: boolean;
  refreshing: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyText: string;
  emptyHint?: string;
  resolveRowKey: (row: T) => string;
  renderContent: (column: IDataTableColumn<T>, row: T, rowIndex: number) => ReactNode;
  columnId: (column: IDataTableColumn<T>, index: number) => string;
  onRowClick?: (row: T) => void;
  className?: string;
};

const mobileRoleOf = <T,>(column: IDataTableColumn<T>, index: number): IColumnMobileRole => {
  if (column.mobile) return column.mobile;
  if (column.key === "actions") return "actions";
  return index === 0 ? "title" : "meta";
};

const SkeletonRow = () => (
  <li className={dataListRow}>
    <span className={dataListSkeletonMain}>
      <Skeleton className={dataListSkeletonTitle} />
      <Skeleton className={dataListSkeletonMeta} />
    </span>
    <Skeleton className={dataListSkeletonAmount} />
  </li>
);

// The compact face of DataTable: each column lands in a slot of one list row by its mobile role.
const DataTableList = <T,>({
  columns,
  rows,
  label,
  loading,
  refreshing,
  error,
  onRetry,
  emptyText,
  emptyHint,
  resolveRowKey,
  renderContent,
  columnId,
  onRowClick,
  className,
}: IProps<T>) => {
  if (loading) {
    return (
      <ul className={dataList} aria-label={label} aria-busy>
        {Array.from({ length: skeletonRows }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </ul>
    );
  }

  if (error && rows.length === 0) return <ErrorState error={error} onRetry={onRetry} />;

  if (rows.length === 0) return <TableEmptyState text={emptyText} hint={emptyHint} />;

  const cardFieldsOf = (row: T, rowIndex: number): ICardFields => {
    const fieldsOf = (role: IColumnMobileRole): ICardField[] =>
      columns.flatMap((column, index) => {
        if (mobileRoleOf(column, index) !== role || column.listHidden) return [];
        const content = column.listRender
          ? column.listRender(row)
          : renderContent(column, row, rowIndex);
        if (isEmptyContent(content)) return [];
        return [
          {
            id: columnId(column, index),
            title: column.title,
            content:
              column.cardPrefix === undefined ? (
                content
              ) : (
                <>
                  {column.cardPrefix} {content}
                </>
              ),
          },
        ];
      });

    return {
      titles: fieldsOf("title"),
      subtitles: fieldsOf("subtitle"),
      amounts: fieldsOf("amount"),
      statuses: fieldsOf("status"),
      metas: fieldsOf("meta"),
      actions: fieldsOf("actions"),
    };
  };

  const renderRow = (row: T, rowIndex: number) => {
    const key = resolveRowKey(row);
    const { titles, subtitles, amounts, statuses, metas, actions } = cardFieldsOf(row, rowIndex);
    const secondaries = [...subtitles, ...metas];
    const titleContent = titles.map((field) => <span key={field.id}>{field.content}</span>);

    return (
      <li key={key} className={dataListRow}>
        <div className={dataListMain}>
          {onRowClick ? (
            <PressArea className={dataListTitlePress} onPress={() => onRowClick(row)}>
              {titleContent}
            </PressArea>
          ) : (
            <span className={dataListTitle}>{titleContent}</span>
          )}
          {secondaries.length > 0 ? (
            <span className={dataListSecondary}>
              {secondaries.map((field, index) => (
                <Fragment key={field.id}>
                  {index > 0 ? (
                    <span className={dataListSeparator} aria-hidden="true">
                      {secondarySeparator}
                    </span>
                  ) : null}
                  <span className={dataListSecondaryItem}>{field.content}</span>
                </Fragment>
              ))}
            </span>
          ) : null}
        </div>

        {amounts.length > 0 || statuses.length > 0 ? (
          <div className={dataListTrail}>
            {amounts.length > 0 ? (
              <span className={dataListAmount}>
                {amounts.map((field) => (
                  <span key={field.id}>{field.content}</span>
                ))}
              </span>
            ) : null}
            {statuses.length > 0 ? (
              <span className={dataListTags}>
                {statuses.map((field) => (
                  <span key={field.id}>{field.content}</span>
                ))}
              </span>
            ) : null}
          </div>
        ) : null}

        {actions.map((field) => (
          <span key={field.id} className={dataListRaised}>
            {field.content}
          </span>
        ))}

        {onRowClick ? <ChevronRight className={dataListChevron} aria-hidden="true" /> : null}
      </li>
    );
  };

  return (
    <div className={cn(dataListFrame, className)}>
      <ul className={dataList} aria-label={label} aria-busy={refreshing}>
        {rows.map(renderRow)}
      </ul>
    </div>
  );
};

export default DataTableList;
