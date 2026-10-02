import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemIdentity,
  itemMeta,
  itemName,
  onHandUnit,
  onHandValue,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { pickCard, pickCardRow } from "../../../styles/transaction/transaction.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import StockStatusBadge from "../../inventory/status/StockStatusBadge";
import CartQuantityControl from "../menus/CartQuantityControl";

type IProps = {
  item: IInventoryItem;
};

// The phone row: what it is, how many are left, and the add control under the thumb.
const TransactionItemCard = ({ item }: IProps) => {
  const meta = [item.sku, item.brand?.name, item.category?.name].filter(Boolean).join(" · ");

  return (
    <article className={pickCard}>
      <span className={itemIdentity}>
        <span className={itemName}>{item.name}</span>
        <span className={itemMeta}>{meta}</span>
      </span>

      <div className={pickCardRow}>
        <span>
          <span className={onHandValue({ status: item.stock_status, size: "lg" })}>
            {formatNumber(item.on_hand)}
          </span>
          <span className={onHandUnit}>{item.unit} left</span>
        </span>
        <StockStatusBadge status={item.stock_status} />
      </div>

      <div className={pickCardRow}>
        <span className={priceText}>
          {item.selling_price === null ? "No price set" : formatPeso(item.selling_price)}
        </span>
        <CartQuantityControl item={item} />
      </div>
    </article>
  );
};

export default TransactionItemCard;
