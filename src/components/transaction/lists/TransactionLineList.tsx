import { useTransactionLines } from "../../../hook/data/transaction/transaction.list.hook";
import { itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import {
  lineAmount,
  lineQuantity,
  lineTotal,
} from "../../../styles/transaction/transaction.styles";
import {
  detailPageList,
  detailPageRow,
  detailPageRowText,
} from "../../../styles/view/detailPage.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";

type IProps = {
  transactionId: string;
};

const TransactionLineList = ({ transactionId }: IProps) => {
  const lines = useTransactionLines(transactionId, true);

  if (lines.isLoading) return <EmptyState compact loading description="Loading items…" />;
  if (lines.isError) {
    return <ErrorState compact error={lines.error} onRetry={() => void lines.refetch()} />;
  }
  if (!lines.data?.length) return <EmptyState compact description="No items found." />;

  return (
    <ul className={detailPageList}>
      {lines.data.map((line) => {
        // The ledger stores a sale as a negative quantity.
        const sold = Math.abs(line.quantity);

        return (
          <li key={line.id} className={detailPageRow}>
            <span className={detailPageRowText}>
              <span className={itemName}>{line.item?.name ?? "Deleted item"}</span>
              <span className={itemMeta}>
                {[
                  line.item?.item_code,
                  line.unit_price === null ? null : `${formatPeso(line.unit_price)} each`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className={lineAmount}>
              <span className={lineTotal}>
                {line.unit_price === null ? "—" : formatPeso(line.unit_price * sold)}
              </span>
              <span className={lineQuantity}>
                × {formatNumber(sold)} {line.item?.unit ?? ""}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default TransactionLineList;
