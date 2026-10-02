import { transactionStatusLabels } from "../../../enums/transaction.enum";
import { useModal } from "../../../hook/common/modal.hook";
import { transactionDetailModalKey } from "../../../keys/modal.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { listRowNote } from "../../../styles/list/list.styles";
import { historyRowTotal } from "../../../styles/transaction/transaction.styles";
import { formatDateTime, formatPeso } from "../../../utils/format.utils";
import ListRow from "../../common/list/ListRow";

type IProps = {
  transaction: ITransaction;
};

const TransactionHistoryRow = ({ transaction }: IProps) => {
  const { openModal } = useModal<ITransaction>(transactionDetailModalKey);
  const voided = transaction.status === "voided";

  return (
    <ListRow
      title={`#${transaction.number}`}
      subtitle={`${formatDateTime(transaction.created_at)} · ${transaction.created_by_name}`}
      onPress={() => openModal(transaction)}
      trailing={
        <>
          <span className={historyRowTotal({ voided })}>
            {transaction.total_amount === null ? "—" : formatPeso(transaction.total_amount)}
          </span>
          <span className={listRowNote({ tone: voided ? "danger" : "muted" })}>
            {transactionStatusLabels[transaction.status]}
          </span>
        </>
      }
    />
  );
};

export default TransactionHistoryRow;
