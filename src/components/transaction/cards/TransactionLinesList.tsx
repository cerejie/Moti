import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import { useTransactionLines } from "../../../hook/data/transaction/transaction.list.hook";
import { formatPeso } from "../../../utils/format.utils";
import { sectionTitle } from "../../../styles/common/typography.styles";
import {
  detailLine,
  detailLineAmount,
  detailLineMeta,
  detailLineName,
  detailLineText,
  detailLines,
  detailLinesList,
  detailTotalRow,
  cartTotalLabel,
  cartTotalValue,
} from "../../../styles/transaction/transaction.styles";

type IProps = {
  transactionId: string;
  total: number;
};

const TransactionLinesList = ({ transactionId, total }: IProps) => {
  const { data: lines = [], isLoading, isError, error, refetch } =
    useTransactionLines(transactionId);

  const body = () => {
    if (isLoading) return <StateBox loading title="Loading items…" />;
    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
    if (lines.length === 0) return <StateBox title="No items on this transaction" />;

    return (
      <ul className={detailLinesList}>
        {lines.map((line) => (
          <li key={line.id} className={detailLine}>
            <div className={detailLineText}>
              <span className={detailLineName}>{line.item_name}</span>
              <span className={detailLineMeta}>
                {line.item_code} · {line.quantity} {line.item_unit ?? ""} ×{" "}
                {line.unit_price === null ? "no price" : formatPeso(line.unit_price)}
              </span>
            </div>
            <span className={detailLineAmount}>{formatPeso(line.line_amount)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className={detailLines}>
      <h3 className={sectionTitle}>Items</h3>
      {body()}
      <div className={detailTotalRow}>
        <span className={cartTotalLabel}>Total amount</span>
        <span className={cartTotalValue}>{formatPeso(total)}</span>
      </div>
    </section>
  );
};

export default TransactionLinesList;
