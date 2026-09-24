import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { useItemMovements } from "../../../hook/data/movement/movement.list.hook";
import MovementTable from "../tables/MovementTable";

type IProps = {
  itemId: string;
};

// The item's own ledger, newest first. Managers only.
const ItemMovementsCard = ({ itemId }: IProps) => {
  const { data, isLoading, isError, error, refetch, tableKey, canView } =
    useItemMovements(itemId);

  if (!canView) return null;

  return (
    <TablePanel
      title="Stock movements"
      description="Every sale, restock and adjustment for this item."
      footer={
        <TablePagination paginationKey={tableKey} totalCount={data?.totalCount ?? 0} />
      }
    >
      <MovementTable
        tableKey={tableKey}
        movements={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        showItem={false}
        emptyText="No movements yet."
      />
    </TablePanel>
  );
};

export default ItemMovementsCard;
