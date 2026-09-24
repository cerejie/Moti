import { Store } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { useInventoryList } from "../../../hook/data/inventory/inventory.list.hook";
import { inventoryTableKey } from "../../../keys/table.keys";
import InventoryTable from "../tables/InventoryTable";
import InventoryToolbar from "./InventoryToolbar";

const InventoryPanel = () => {
  const { data, isLoading, isError, error, refetch, shopId, tab, canManage, openItem } =
    useInventoryList();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to see its inventory.
      </StateBox>
    );
  }

  return (
    <TablePanel
      toolbar={<InventoryToolbar showArchived={canManage} />}
      footer={
        <TablePagination
          paginationKey={inventoryTableKey}
          totalCount={data?.totalCount ?? 0}
        />
      }
    >
      <InventoryTable
        items={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        canManage={canManage}
        onOpen={openItem}
        emptyText={tab === "archived" ? "No archived items." : "No items match these filters."}
      />
    </TablePanel>
  );
};

export default InventoryPanel;
