import { stockStatusLabels } from "../../../enums/stock.enum";
import { useItemBranchStock } from "../../../hook/data/inventory/inventory.list.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemName,
  onHandUnit,
  onHandValue,
  stockStatusText,
} from "../../../styles/inventory/inventory.styles";
import {
  detailPageList,
  detailPageRow,
  detailPageRowText,
} from "../../../styles/view/detailPage.styles";
import { formatNumber } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";

type IProps = {
  item: IInventoryItem;
};

// Where the item sits: each branch that carries it, with its own count and warning.
const ItemBranchStockList = ({ item }: IProps) => {
  const rows = useItemBranchStock(item.id);

  if (rows.isLoading) return <EmptyState compact loading description="Loading branches…" />;
  if (rows.isError) {
    return <ErrorState compact error={rows.error} onRetry={() => void rows.refetch()} />;
  }
  if (!rows.data?.length) {
    return <EmptyState compact description="No branch carries this item yet." />;
  }

  return (
    <ul className={detailPageList}>
      {rows.data.map((row) => (
        <li key={row.branch_id} className={detailPageRow}>
          <span className={detailPageRowText}>
            <span className={itemName}>{row.branch?.name ?? "Branch"}</span>
            <span className={stockStatusText({ status: row.stock_status })}>
              {stockStatusLabels[row.stock_status]}
            </span>
          </span>
          <span>
            <span className={onHandValue({ status: row.stock_status })}>
              {formatNumber(row.on_hand)}
            </span>
            <span className={onHandUnit}>{item.unit}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ItemBranchStockList;
