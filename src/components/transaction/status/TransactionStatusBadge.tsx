import {
  transactionStatusLabels,
  transactionStatusTones,
  type TransactionStatus,
} from "../../../enums/transaction.enum";
import StatusBadge from "../../common/status/StatusBadge";

type IProps = {
  status: TransactionStatus;
};

const TransactionStatusBadge = ({ status }: IProps) => (
  <StatusBadge tone={transactionStatusTones[status]} dot>
    {transactionStatusLabels[status]}
  </StatusBadge>
);

export default TransactionStatusBadge;
