import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useBranchArchive } from "../../../hook/data/branch/branch.form.hook";
import { useBranchList } from "../../../hook/data/branch/branch.list.hook";
import { branchFormModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import type { IBranch } from "../../../models/data/branch/branch.response";
import { itemName, mutedText } from "../../../styles/inventory/inventory.styles";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatCount, formatNumber, formatShortDate } from "../../../utils/format.utils";
import StatusBadge from "../../common/status/StatusBadge";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";

const itemCountOf = (branch: IBranch) => branch.branch_stock[0]?.count ?? 0;

const statusOf = (branch: IBranch) =>
  branch.archived_at ? (
    <StatusBadge tone="neutral">Archived</StatusBadge>
  ) : (
    <StatusBadge tone="success" dot>
      Active
    </StatusBadge>
  );

const buildColumns = (
  actionsOf: (branch: IBranch) => IRowAction[],
): IDataTableColumn<IBranch>[] => [
  {
    key: "name",
    title: "Branch",
    render: (_, branch) => <span className={itemName}>{branch.name}</span>,
    listRender: (branch) => branch.name,
  },
  {
    key: "status",
    title: "Status",
    mobile: "status",
    render: (_, branch) => statusOf(branch),
    listRender: (branch) => statusOf(branch),
  },
  {
    key: "items",
    title: "Items",
    render: (_, branch) => <span className={mutedText}>{formatNumber(itemCountOf(branch))}</span>,
    listRender: (branch) => (
      <span className={mutedText}>{formatCount(itemCountOf(branch), "product")}</span>
    ),
  },
  {
    key: "created",
    title: "Added",
    render: (_, branch) => <span className={mutedText}>{formatShortDate(branch.created_at)}</span>,
    listRender: (branch) => `Added ${formatShortDate(branch.created_at)}`,
  },
  {
    key: "actions",
    title: "Action",
    align: "center",
    className: nowrapCell,
    render: (_, branch) => (
      <RowActionMenu label={`Manage ${branch.name}`} actions={actionsOf(branch)} />
    ),
  },
];

const BranchTable = () => {
  const { query, branches } = useBranchList();
  const { openModal } = useModal<IBranch>(branchFormModalKey);
  const { archive, restore } = useBranchArchive();

  const actionsOf = (branch: IBranch): IRowAction[] => [
    { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openModal(branch) },
    branch.archived_at
      ? {
          key: "restore",
          label: "Restore",
          icon: <ArchiveRestore />,
          onSelect: () => restore(branch),
        }
      : {
          key: "archive",
          label: "Archive",
          icon: <Archive />,
          danger: true,
          onSelect: () => archive(branch),
        },
  ];

  return (
    <TablePanel fill>
      <DataTable<IBranch>
        label="Branches"
        columns={buildColumns(actionsOf)}
        data={branches}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyText="No branches yet. Add the first one."
        fill
      />
    </TablePanel>
  );
};

export default BranchTable;
