import { Minus, Plus, Trash2 } from "lucide-react";
import { useOrderLineActions } from "../../../hook/data/order/order.form.hook";
import type { IOrderListLine } from "../../../models/data/order/order.response";
import { clampDeliveryQuantity } from "../../../store/data/delivery/delivery.store";
import { itemIdentity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  cartList,
  cartRow,
  cartRowBottom,
  cartRowTop,
  quantityStepper,
} from "../../../styles/transaction/transaction.styles";
import { formatNumber } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import QuantityInput from "../../common/form/QuantityInput";

type IProps = {
  lines: readonly IOrderListLine[];
};

const OrderLineList = ({ lines }: IProps) => {
  const { setQuantity, remove } = useOrderLineActions();
  const change = (line: IOrderListLine, quantity: number) =>
    setQuantity(line, clampDeliveryQuantity(quantity));

  return (
    <ul className={cartList}>
      {lines.map((line) => {
        const { item, quantity } = line;

        return (
          <li key={line.id} className={cartRow}>
            <div className={cartRowTop}>
              <span className={itemIdentity}>
                <span className={itemName}>{item.name}</span>
                <span className={itemMeta}>
                  {item.item_code} · {formatNumber(item.on_hand)} {item.unit} on hand
                </span>
              </span>
              <AppButton
                size="icon-lg"
                variant="ghost"
                aria-label={`Remove ${item.name}`}
                onPress={() => remove(line)}
              >
                <Trash2 />
              </AppButton>
            </div>
            <div className={cartRowBottom}>
              <span className={itemMeta}>To order ({item.unit})</span>
              <div className={quantityStepper}>
                <AppButton
                  size="icon-lg"
                  variant="outline"
                  aria-label={`One less ${item.name}`}
                  disabled={quantity <= 1}
                  onPress={() => change(line, quantity - 1)}
                >
                  <Minus />
                </AppButton>
                <QuantityInput
                  label={`Quantity of ${item.name} to buy`}
                  value={quantity}
                  min={1}
                  max={99_999}
                  onChange={(next) => {
                    if (next !== null && next !== quantity) change(line, next);
                  }}
                />
                <AppButton
                  size="icon-lg"
                  variant="outline"
                  aria-label={`One more ${item.name}`}
                  onPress={() => change(line, quantity + 1)}
                >
                  <Plus />
                </AppButton>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default OrderLineList;
