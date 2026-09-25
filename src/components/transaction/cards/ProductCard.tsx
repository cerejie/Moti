import AppButton from "../../common/button/AppButton";
import StatusBadge from "../../common/status/StatusBadge";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { formatCount, formatPeso } from "../../../utils/format.utils";
import {
  productCard,
  productCardText,
  productFooter,
  productMeta,
  productName,
  productPrice,
  productPriceMissing,
  productStock,
} from "../../../styles/transaction/transaction.styles";

type IProps = {
  item: IInventoryItem;
  inCart: number;
  onAdd: (item: IInventoryItem) => void;
};

// One tap adds one to the cart; nothing more than the stock on hand fits.
const ProductCard = ({ item, inCart, onAdd }: IProps) => {
  const outOfStock = item.on_hand === 0;
  const full = inCart >= item.on_hand;

  return (
    <AppButton
      variant="outline"
      className={productCard}
      disabled={full}
      onPress={() => onAdd(item)}
      aria-label={`Add ${item.name}`}
    >
      <span className={productCardText}>
        <span className={productName}>{item.name}</span>
        <span className={productMeta}>{item.item_code}</span>
      </span>
      <span className={productFooter}>
        {item.selling_price === null ? (
          <span className={productPriceMissing}>No price</span>
        ) : (
          <span className={productPrice}>{formatPeso(item.selling_price)}</span>
        )}
        {outOfStock ? (
          <StatusBadge tone="danger">Out of stock</StatusBadge>
        ) : inCart > 0 ? (
          <StatusBadge tone="info">{inCart} in cart</StatusBadge>
        ) : (
          <span className={productStock}>
            {formatCount(item.on_hand)} {item.unit}
          </span>
        )}
      </span>
    </AppButton>
  );
};

export default ProductCard;
