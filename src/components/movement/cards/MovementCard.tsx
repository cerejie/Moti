import {
  movementReasonLabels,
  movementReasonTones,
} from "../../../enums/stock.enum";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { historyQuantity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  movementBalance,
  movementCard,
  movementCardFigures,
  movementCardText,
} from "../../../styles/movement/movement.styles";
import { formatDateTime, formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import StatusBadge from "../../common/status/StatusBadge";

type IProps = {
  movement: IStockMovement;
};

const MovementCard = ({ movement }: IProps) => (
  <article className={movementCard}>
    <div className={movementCardText}>
      <span className={itemName}>{movement.item?.name ?? "Deleted item"}</span>
      <span className={itemMeta}>
        {formatDateTime(movement.created_at)} · {movement.created_by_name}
      </span>
      <StatusBadge tone={movementReasonTones[movement.reason]}>
        {movementReasonLabels[movement.reason]}
      </StatusBadge>
    </div>
    <div className={movementCardFigures}>
      <span className={historyQuantity({ direction: movement.quantity > 0 ? "in" : "out" })}>
        {formatSignedQuantity(movement.quantity)}
      </span>
      <span className={movementBalance}>
        Left: {formatNumber(movement.balance_after)} {movement.item?.unit ?? ""}
      </span>
    </div>
  </article>
);

export default MovementCard;
