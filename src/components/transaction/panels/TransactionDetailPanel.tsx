import { useParams } from "react-router-dom";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import { useTransaction } from "../../../hook/data/transaction/transaction.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { detailPageSurface } from "../../../styles/view/detailPage.styles";
import { formatDateTime } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageLayout from "../../common/view/DetailPageLayout";
import DetailPageSection from "../../common/view/DetailPageSection";
import TransactionTotalCard from "../cards/TransactionTotalCard";
import TransactionLineList from "../lists/TransactionLineList";
import TransactionManageActions from "../menus/TransactionManageActions";

const voidItems: IDetailItem<ITransaction>[] = [
  { key: "voided_at", label: "When", render: (tx) => formatDateTime(tx.voided_at) },
  { key: "voided_by", label: "By", render: (tx) => tx.voided_by_name ?? "—" },
  { key: "reason", label: "Reason", render: (tx) => tx.void_reason ?? "—" },
];

const TransactionDetailPanel = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const query = useTransaction(transactionId);
  const { voidTransaction } = usePermissions();
  const { multiple } = useActiveBranch();
  const transaction = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading sale…" />;
  if (!transaction) {
    return (
      <ErrorState
        error={query.error}
        title="Sale not found"
        onRetry={() => void query.refetch()}
      />
    );
  }

  const voided = transaction.status === "voided";

  return (
    <DetailPageLayout
      title={`Sale #${transaction.number}`}
      meta={[
        formatDateTime(transaction.created_at),
        transaction.created_by_name,
        multiple ? transaction.branch?.name : null,
      ]
        .filter(Boolean)
        .join(" · ")}
      aside={
        voided ? (
          <DetailPageSection title="Cancelled">
            <div className={detailPageSurface}>
              <DetailRows record={transaction} items={voidItems} />
            </div>
          </DetailPageSection>
        ) : (
          voidTransaction && (
            <DetailPageSection title="Manage">
              <TransactionManageActions transaction={transaction} />
            </DetailPageSection>
          )
        )
      }
    >
      <TransactionTotalCard transaction={transaction} />

      <DetailPageSection title="Items sold">
        <TransactionLineList transactionId={transaction.id} />
      </DetailPageSection>
    </DetailPageLayout>
  );
};

export default TransactionDetailPanel;
