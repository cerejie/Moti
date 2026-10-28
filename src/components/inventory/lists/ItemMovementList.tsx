import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { movementReasonLabels } from "../../../enums/stock.enum";
import { useItemMovements } from "../../../hook/data/movement/movement.list.hook";
import {
  itemMeta,
  itemMovementIcon,
  itemName,
  historyQuantity,
} from "../../../styles/inventory/inventory.styles";
import {
  detailPageList,
  detailPageRow,
  detailPageRowText,
} from "../../../styles/view/detailPage.styles";
import { formatDateTime, formatSignedQuantity } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";

type IProps = {
  itemId: string;
};

const ItemMovementList = ({ itemId }: IProps) => {
  const history = useItemMovements(itemId, true);

  if (history.isLoading) return <EmptyState compact loading description="Loading history…" />;
  if (history.isError) {
    return <ErrorState compact error={history.error} onRetry={() => void history.refetch()} />;
  }
  if (!history.data?.length) return <EmptyState compact description="No stock movements yet." />;

  return (
    <ul className={detailPageList}>
      {history.data.map((movement) => {
        const direction = movement.quantity > 0 ? "in" : "out";

        return (
          <li key={movement.id} className={detailPageRow}>
            <span className={itemMovementIcon({ direction })} aria-hidden>
              {direction === "in" ? <ArrowUpRight /> : <ArrowDownRight />}
            </span>
            <span className={detailPageRowText}>
              <span className={itemName}>{movementReasonLabels[movement.reason]}</span>
              <span className={itemMeta}>
                {formatDateTime(movement.created_at)} · {movement.created_by_name}
                {movement.note ? ` · ${movement.note}` : ""}
              </span>
            </span>
            <span className={historyQuantity({ direction })}>
              {formatSignedQuantity(movement.quantity)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default ItemMovementList;
