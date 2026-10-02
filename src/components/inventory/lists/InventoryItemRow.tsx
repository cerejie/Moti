import { stockStatusLabels } from "../../../enums/stock.enum";
import { useModal } from "../../../hook/common/modal.hook";
import { itemDetailModalKey } from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  onHandUnit,
  onHandValue,
  stockStatusText,
} from "../../../styles/inventory/inventory.styles";
import { formatNumber } from "../../../utils/format.utils";
import ListRow from "../../common/list/ListRow";

type IProps = {
  item: IInventoryItem;
};

// The phone row: what it is on the left, how much is left on the right; stock actions live in the sheet.
const InventoryItemRow = ({ item }: IProps) => {
  const detailModal = useModal<IInventoryItem>(itemDetailModalKey);
  const archived = item.archived_at !== null;

  return (
    <ListRow
      title={item.name}
      subtitle={[item.item_code, item.brand?.name].filter(Boolean).join(" · ")}
      onPress={() => detailModal.openModal(item)}
      trailing={
        <>
          <span>
            <span className={onHandValue({ status: item.stock_status })}>
              {formatNumber(item.on_hand)}
            </span>
            <span className={onHandUnit}>{item.unit}</span>
          </span>
          <span className={stockStatusText({ status: archived ? "archived" : item.stock_status })}>
            {archived ? "Archived" : stockStatusLabels[item.stock_status]}
          </span>
        </>
      }
    />
  );
};

export default InventoryItemRow;
