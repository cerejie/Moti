import { ArrowRight } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import TablePanel from "../../common/table/TablePanel";
import { useRecentMovements } from "../../../hook/data/dashboard/dashboard.list.hook";
import { useOpenMovements } from "../../../hook/data/inventory/inventory.list.hook";
import { recentMovementTableKey } from "../../../keys/table.keys";
import MovementTable from "../../movement/tables/MovementTable";

const RecentMovementsCard = () => {
  const { data, isLoading, isError, error, refetch, openItem } = useRecentMovements();
  const openMovements = useOpenMovements();

  return (
    <TablePanel
      title="Recent movements"
      description="The latest sales, restocks and adjustments."
      actions={
        <AppButton variant="outline" onPress={openMovements}>
          View all
          <ArrowRight />
        </AppButton>
      }
    >
      <MovementTable
        tableKey={recentMovementTableKey}
        movements={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        showItem
        onOpenItem={openItem}
        emptyText="No movements yet."
      />
    </TablePanel>
  );
};

export default RecentMovementsCard;
