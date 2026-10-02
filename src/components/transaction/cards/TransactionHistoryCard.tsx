import { useModal } from "../../../hook/common/modal.hook";
import { transactionDetailModalKey } from "../../../keys/modal.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { itemIdentity, itemMeta, itemName, priceText } from "../../../styles/inventory/inventory.styles";
import { historyCard, historyCardRow } from "../../../styles/transaction/transaction.styles";
import { formatDateTime, formatNumber, formatPeso } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import TransactionStatusBadge from "../status/TransactionStatusBadge";

type IProps = {
  transaction: ITransaction;
};

const TransactionHistoryCard = ({ transaction }: IProps) => {
  const { openModal } = useModal<ITransaction>(transactionDetailModalKey);

  return (
    <AppButton
      variant="ghost"
      className={historyCard}
      aria-label={`Open transaction #${transaction.number}`}
      onPress={() => openModal(transaction)}
    >
      <span className={historyCardRow}>
        <span className={itemIdentity}>
          <span className={itemName}>#{transaction.number}</span>
          <span className={itemMeta}>
            {formatDateTime(transaction.created_at)} · {transaction.created_by_name}
          </span>
        </span>
        <TransactionStatusBadge status={transaction.status} />
      </span>
      <span className={historyCardRow}>
        <span className={itemMeta}>
          {formatNumber(transaction.line_count)} items ·{" "}
          {formatNumber(transaction.total_quantity)} pcs
        </span>
        <span className={priceText}>
          {transaction.total_amount === null ? "—" : formatPeso(transaction.total_amount)}
        </span>
      </span>
    </AppButton>
  );
};

export default TransactionHistoryCard;
