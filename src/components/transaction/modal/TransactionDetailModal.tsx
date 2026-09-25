import { Ban } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import DetailModal from "../../common/modal/DetailModal";
import StatusBadge from "../../common/status/StatusBadge";
import {
  transactionStatusLabels,
  transactionStatusTones,
} from "../../../enums/transaction.enum";
import {
  useTransactionDetail,
  useVoidTransactionModal,
} from "../../../hook/data/transaction/transaction.form.hook";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { formatDateTime, formatTransactionNo } from "../../../utils/format.utils";
import TransactionLinesList from "../cards/TransactionLinesList";

const summarySection: IDetailSection<ITransaction> = {
  key: "summary",
  title: "Summary",
  items: [
    {
      key: "status",
      label: "Status",
      render: (transaction) => (
        <StatusBadge tone={transactionStatusTones[transaction.status]}>
          {transactionStatusLabels[transaction.status]}
        </StatusBadge>
      ),
    },
    { key: "occurred_at", label: "When", render: (transaction) => formatDateTime(transaction.occurred_at) },
    { key: "created_by", label: "Taken by", render: (transaction) => transaction.created_by_name ?? "—" },
  ],
};

const voidSection: IDetailSection<ITransaction> = {
  key: "void",
  title: "Void",
  items: [
    { key: "voided_by", label: "Voided by", render: (transaction) => transaction.voided_by_name ?? "—" },
    { key: "voided_at", label: "Voided at", render: (transaction) => formatDateTime(transaction.voided_at) },
    { key: "void_reason", label: "Reason", span: 2, render: (transaction) => transaction.void_reason ?? "—" },
  ],
};

const TransactionDetailModal = () => {
  const { open, transaction, onOpenChange, closeDetail, canVoid } = useTransactionDetail();
  const { openVoid } = useVoidTransactionModal();

  return (
    <DetailModal<ITransaction>
      open={open}
      onOpenChange={onOpenChange}
      title={transaction ? `Transaction ${formatTransactionNo(transaction.transaction_no)}` : "Transaction"}
      size="md"
      record={transaction}
      header={
        transaction && (
          <TransactionLinesList
            transactionId={transaction.id}
            total={transaction.total_amount}
          />
        )
      }
      sections={transaction?.status === "voided" ? [summarySection, voidSection] : [summarySection]}
      footer={
        <>
          <AppButton variant="secondary" onPress={closeDetail}>
            Close
          </AppButton>
          {canVoid && transaction && (
            <AppButton variant="destructive" onPress={() => openVoid(transaction)}>
              <Ban />
              Void
            </AppButton>
          )}
        </>
      }
    />
  );
};

export default TransactionDetailModal;
