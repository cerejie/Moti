import {
  stockStatusLabels,
  stockStatusTones,
  type StockStatus,
} from "../../../enums/stock.enum";
import StatusBadge from "../../common/status/StatusBadge";

type IProps = {
  status: StockStatus;
  archived?: boolean;
};

const StockStatusBadge = ({ status, archived = false }: IProps) =>
  archived ? (
    <StatusBadge tone="neutral">Archived</StatusBadge>
  ) : (
    <StatusBadge tone={stockStatusTones[status]} dot>
      {stockStatusLabels[status]}
    </StatusBadge>
  );

export default StockStatusBadge;
