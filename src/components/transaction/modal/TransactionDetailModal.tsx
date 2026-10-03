import { Ban, Receipt, ShoppingCart } from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useTransactionLines } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionDetailModalKey, transactionVoidModalKey } from "../../../keys/modal.keys";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { sectionTitle } from "../../../styles/common/typography.styles";
import {
  historyList,
  historyQuantity,
  historyRow,
  historyText,
  itemMeta,
  itemName,
} from "../../../styles/inventory/inventory.styles";
import { detailSection, detailSectionHeader } from "../../../styles/modal/detail.styles";
import {
  formatCount,
  formatDateTime,
  formatPeso,
  formatSignedQuantity,
} from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import DetailModal from "../../common/modal/DetailModal";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import TransactionStatusBadge from "../status/TransactionStatusBadge";

const sections: IDetailSection<ITransaction>[] = [
  {
    key: "summary",
    title: "Summary",
    icon: <Receipt />,
    items: [
      { key: "status", label: "Status", render: (tx) => <TransactionStatusBadge status={tx.status} /> },
      { key: "when", label: "When", render: (tx) => formatDateTime(tx.created_at) },
      { key: "by", label: "Recorded by", render: (tx) => tx.created_by_name },
      {
        key: "items",
        label: "Items",
        render: (tx) => `${formatCount(tx.line_count, "item")} · ${formatCount(tx.total_quantity, "pc")}`,
      },
      {
        key: "total",
        label: "Total",
        render: (tx) => (tx.total_amount === null ? "—" : formatPeso(tx.total_amount)),
      },
      { key: "note", label: "Note", render: (tx) => tx.note ?? "—" },
    ],
  },
];

const voidSection: IDetailSection<ITransaction> = {
  key: "void",
  title: "Voided",
  icon: <Ban />,
  items: [
    { key: "voided_at", label: "When", render: (tx) => formatDateTime(tx.voided_at) },
    { key: "voided_by", label: "By", render: (tx) => tx.voided_by_name ?? "—" },
    { key: "reason", label: "Reason", span: 2, render: (tx) => tx.void_reason ?? "—" },
  ],
};

const TransactionDetailModal = () => {
  const { modal, closeModal } = useModal<ITransaction>(transactionDetailModalKey);
  const voidModal = useModal<ITransaction>(transactionVoidModalKey);
  const { voidTransaction } = usePermissions();
  const transaction = modal.data;
  const lines = useTransactionLines(transaction?.id, modal.visible);
  const voided = transaction?.status === "voided";

  // One dialog at a time: the detail closes and the void form takes its place.
  const startVoid = (record: ITransaction) => {
    closeModal();
    voidModal.openModal(record);
  };

  const renderLines = () => {
    if (lines.isLoading) return <StateBox loading>Loading items…</StateBox>;
    if (lines.isError) {
      return <ErrorState error={lines.error} onRetry={() => void lines.refetch()} />;
    }
    if (!lines.data?.length) return <StateBox>No items found.</StateBox>;

    return (
      <ul className={historyList}>
        {lines.data.map((line) => (
          <li key={line.id} className={historyRow}>
            <span className={historyText}>
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
            <span className={historyQuantity({ direction: "out" })}>
              {formatSignedQuantity(line.quantity)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DetailModal
      open={modal.visible}
      onOpenChange={(open) => !open && closeModal()}
      title={transaction ? `Transaction #${transaction.number}` : "Transaction"}
      size="md"
      record={transaction}
      sections={voided ? [...sections, voidSection] : sections}
      footer={
        voidTransaction &&
        transaction &&
        !voided && (
          <AppButton tone="dangerSoft" onPress={() => startVoid(transaction)}>
            <Ban />
            Void transaction
          </AppButton>
        )
      }
    >
      <section className={detailSection}>
        <div className={detailSectionHeader}>
          <ShoppingCart aria-hidden />
          <h3 className={sectionTitle}>Items sold</h3>
        </div>
        {renderLines()}
      </section>
    </DetailModal>
  );
};

export default TransactionDetailModal;
