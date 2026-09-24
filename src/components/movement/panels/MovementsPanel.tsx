import { Store } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { useMovementList } from "../../../hook/data/movement/movement.list.hook";
import { movementTableKey } from "../../../keys/table.keys";
import MovementTable from "../tables/MovementTable";
import MovementToolbar from "./MovementToolbar";

const MovementsPanel = () => {
  const { data, isLoading, isError, error, refetch, shopId, openItem } = useMovementList();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to see its stock movements.
      </StateBox>
    );
  }

  return (
    <TablePanel
      toolbar={<MovementToolbar />}
      footer={
        <TablePagination
          paginationKey={movementTableKey}
          totalCount={data?.totalCount ?? 0}
        />
      }
    >
      <MovementTable
        tableKey={movementTableKey}
        movements={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        showItem
        onOpenItem={openItem}
        emptyText="No stock movements match these filters."
      />
    </TablePanel>
  );
};

export default MovementsPanel;
