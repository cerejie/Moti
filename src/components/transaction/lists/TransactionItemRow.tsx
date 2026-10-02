import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { stockStatusText } from "../../../styles/inventory/inventory.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import ListRow from "../../common/list/ListRow";
import CartQuantityControl from "../menus/CartQuantityControl";

type IProps = {
  item: IInventoryItem;
};

// The picker row: price and stock left under the name, the Add / stepper under the thumb.
const TransactionItemRow = ({ item }: IProps) => (
  <ListRow
    title={item.name}
    subtitle={
      <>
        {item.selling_price === null ? "No price set" : formatPeso(item.selling_price)} ·{" "}
        <span className={stockStatusText({ status: item.stock_status })}>
          {formatNumber(item.on_hand)} {item.unit} left
        </span>
      </>
    }
    action={<CartQuantityControl item={item} />}
  />
);

export default TransactionItemRow;
