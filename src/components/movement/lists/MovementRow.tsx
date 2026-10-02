import { movementReasonLabels } from "../../../enums/stock.enum";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { historyQuantity } from "../../../styles/inventory/inventory.styles";
import { movementBalance } from "../../../styles/movement/movement.styles";
import { formatDateTime, formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import ListRow from "../../common/list/ListRow";

type IProps = {
  movement: IStockMovement;
};

const MovementRow = ({ movement }: IProps) => (
  <ListRow
    title={movement.item?.name ?? "Deleted item"}
    subtitle={`${movementReasonLabels[movement.reason]} · ${formatDateTime(movement.created_at)} · ${movement.created_by_name}`}
    trailing={
      <>
        <span className={historyQuantity({ direction: movement.quantity > 0 ? "in" : "out" })}>
          {formatSignedQuantity(movement.quantity)}
        </span>
        <span className={movementBalance}>
          {formatNumber(movement.balance_after)} {movement.item?.unit ?? ""} left
        </span>
      </>
    }
  />
);

export default MovementRow;
