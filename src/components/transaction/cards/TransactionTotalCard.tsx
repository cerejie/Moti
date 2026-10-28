import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { transactionTotal } from "../../../styles/transaction/transaction.styles";
import {
  detailHeroBody,
  detailHeroFigure,
  detailHeroHint,
  detailHeroLabel,
  detailHeroTop,
} from "../../../styles/view/detailPage.styles";
import { formatCount, formatPeso } from "../../../utils/format.utils";
import SectionCard from "../../common/card/SectionCard";
import TransactionStatusBadge from "../status/TransactionStatusBadge";

type IProps = {
  transaction: ITransaction;
};

const TransactionTotalCard = ({ transaction }: IProps) => (
  <SectionCard>
    <div className={detailHeroBody}>
      <div className={detailHeroTop}>
        <div className={detailHeroFigure}>
          <span className={detailHeroLabel}>Total</span>
          <span className={transactionTotal({ voided: transaction.status === "voided" })}>
            {transaction.total_amount === null ? "—" : formatPeso(transaction.total_amount)}
          </span>
          <span className={detailHeroHint}>
            {formatCount(transaction.line_count, "item")} ·{" "}
            {formatCount(transaction.total_quantity, "pc")}
          </span>
          {transaction.note && <span className={detailHeroHint}>{transaction.note}</span>}
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </div>
    </div>
  </SectionCard>
);

export default TransactionTotalCard;
