import { Trash2 } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import QuantityStepper from "../../common/form/QuantityStepper";
import { lineTotal } from "../../../hook/data/transaction/transaction.form.hook";
import type { ICartLine } from "../../../models/data/transaction/transaction.request";
import { formatPeso } from "../../../utils/format.utils";
import {
  cartLine,
  cartLineAmount,
  cartLineFooter,
  cartLineHeader,
  cartLineMeta,
  cartLineName,
  cartLineText,
  cartRemove,
} from "../../../styles/transaction/transaction.styles";

type IProps = {
  line: ICartLine;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

const CartLine = ({ line, onQuantityChange, onRemove }: IProps) => {
  const price = line.unit_price === null ? "No price" : `${formatPeso(line.unit_price)} each`;

  return (
    <li className={cartLine}>
      <div className={cartLineHeader}>
        <div className={cartLineText}>
          <span className={cartLineName}>{line.name}</span>
          <span className={cartLineMeta}>
            {line.item_code} · {price} · {line.on_hand} {line.unit} on hand
          </span>
        </div>
        <AppButton
          variant="ghost"
          size="icon-sm"
          className={cartRemove}
          onPress={() => onRemove(line.item_id)}
          aria-label={`Remove ${line.name}`}
        >
          <Trash2 />
        </AppButton>
      </div>
      <div className={cartLineFooter}>
        <QuantityStepper
          value={line.quantity}
          max={line.on_hand}
          onChange={(quantity) => onQuantityChange(line.item_id, quantity)}
          label={line.name}
        />
        <span className={cartLineAmount}>{formatPeso(lineTotal(line))}</span>
      </div>
    </li>
  );
};

export default CartLine;
