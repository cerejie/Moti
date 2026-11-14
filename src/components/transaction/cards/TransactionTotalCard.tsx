import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { transactionTotal } from "../../../styles/transaction/transaction.styles";
import {
  detailHeroBody,
  detailHeroFigure,
  detailHeroHint,
  detailHeroLabel,
  detailHeroTop,
} from "../../../styles/view/detailPage.styles";
import { formatCount } from "../../../utils/format.utils";
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
          <span className={detailHeroLabel}>Sold</span>
          {/* Each line keeps its own unit below; mixed units are never summed. */}
          <span className={transactionTotal({ voided: transaction.status === "voided" })}>
            {formatCount(transaction.line_count, "product")}
          </span>
          {transaction.note && <span className={detailHeroHint}>{transaction.note}</span>}
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </div>
    </div>
  </SectionCard>
);

export default TransactionTotalCard;
