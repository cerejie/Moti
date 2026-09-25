import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import ErrorState from "../../common/status/ErrorState";
import ListSkeleton from "../../common/status/ListSkeleton";
import StateBox from "../../common/status/StateBox";
import RowActionMenu from "../../common/table/RowActionMenu";
import type { IRowAction } from "../../../models/common/action.model";
import {
  masterfileCount,
  masterfileList,
  masterfileMeta,
  masterfileName,
  masterfileRow,
  masterfileRowText,
  masterfileStack,
  masterfileToolbar,
} from "../../../styles/masterfile/masterfile.styles";

type IRow = { id: string; name: string };

type IProps<TRow extends IRow> = {
  rows: TRow[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  // e.g. "category" / "categories", for the count line.
  noun: { one: string; many: string };
  addLabel: string;
  onAdd: () => void;
  metaOf: (row: TRow) => string;
  actionsFor: (row: TRow) => IRowAction[];
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyText: string;
};

// One masterfile tab: a count and an Add button, then the entries with their actions.
const MasterfileList = <TRow extends IRow>({
  rows,
  isLoading,
  isError,
  error,
  onRetry,
  noun,
  addLabel,
  onAdd,
  metaOf,
  actionsFor,
  emptyIcon,
  emptyTitle,
  emptyText,
}: IProps<TRow>) => {
  const renderBody = () => {
    if (isLoading) return <ListSkeleton rows={4} />;
    if (isError) return <ErrorState error={error} onRetry={onRetry} />;
    if (rows.length === 0) {
      return (
        <StateBox icon={emptyIcon} title={emptyTitle}>
          {emptyText}
        </StateBox>
      );
    }

    return (
      <ul className={masterfileList}>
        {rows.map((row) => (
          <li key={row.id} className={masterfileRow}>
            <div className={masterfileRowText}>
              <span className={masterfileName}>{row.name}</span>
              <span className={masterfileMeta}>{metaOf(row)}</span>
            </div>
            <RowActionMenu label={row.name} actions={actionsFor(row)} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={masterfileStack}>
      <div className={masterfileToolbar}>
        <span className={masterfileCount}>
          {isLoading ? "" : `${rows.length} ${rows.length === 1 ? noun.one : noun.many}`}
        </span>
        <AppButton onPress={onAdd}>
          <Plus />
          {addLabel}
        </AppButton>
      </div>
      {renderBody()}
    </div>
  );
};

export default MasterfileList;
