import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { movementReasonLabels, movementReasonTones } from "../../../enums/stock.enum";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { itemMovementIcon, onHandUnit } from "../../../styles/inventory/inventory.styles";
import {
  movementHeroQuantity,
  movementHeroValue,
} from "../../../styles/movement/movement.styles";
import {
  detailHeroBody,
  detailHeroFigure,
  detailHeroHint,
  detailHeroLabel,
  detailHeroTop,
} from "../../../styles/view/detailPage.styles";
import { formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import SectionCard from "../../common/card/SectionCard";
import StatusBadge from "../../common/status/StatusBadge";

type IProps = {
  movement: IStockMovement;
};

const MovementQuantityCard = ({ movement }: IProps) => {
  const direction = movement.quantity > 0 ? "in" : "out";
  const unit = movement.item?.unit ?? "";

  return (
    <SectionCard>
      <div className={detailHeroBody}>
        <div className={detailHeroTop}>
          <div className={detailHeroFigure}>
            <span className={detailHeroLabel}>Quantity</span>
            <span className={movementHeroValue}>
              <span className={itemMovementIcon({ direction })} aria-hidden>
                {direction === "in" ? <ArrowUpRight /> : <ArrowDownRight />}
              </span>
              <span>
                <span className={movementHeroQuantity({ direction })}>
                  {formatSignedQuantity(movement.quantity)}
                </span>
                <span className={onHandUnit}>{unit}</span>
              </span>
            </span>
            <span className={detailHeroHint}>
              Left after: {formatNumber(movement.balance_after)} {unit}
            </span>
          </div>
          <StatusBadge tone={movementReasonTones[movement.reason]}>
            {movementReasonLabels[movement.reason]}
          </StatusBadge>
        </div>
      </div>
    </SectionCard>
  );
};

export default MovementQuantityCard;
