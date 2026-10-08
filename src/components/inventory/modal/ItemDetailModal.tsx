import {
  Archive,
  ArchiveRestore,
  History,
  Info,
  PackageMinus,
  PackagePlus,
  Pencil,
  Warehouse,
} from "lucide-react";
import { movementReasonLabels } from "../../../enums/stock.enum";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useItemArchive } from "../../../hook/data/inventory/inventory.form.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import { useItemMovements } from "../../../hook/data/movement/movement.list.hook";
import { itemDetailModalKey, itemFormModalKey } from "../../../keys/modal.keys";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { StockAction } from "../../../enums/stock.enum";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { sectionTitle } from "../../../styles/common/typography.styles";
import { detailSection, detailSectionHeader } from "../../../styles/modal/detail.styles";
import {
  detailActions,
  historyList,
  historyQuantity,
  historyRow,
  historyText,
  itemMeta,
  itemName,
  onHandUnit,
  onHandValue,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import {
  formatDateTime,
  formatNumber,
  formatPeso,
  formatSignedQuantity,
} from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import DetailModal from "../../common/modal/DetailModal";
import ErrorState from "../../common/status/ErrorState";
import EmptyState from "../../common/status/EmptyState";
import StockStatusBadge from "../status/StockStatusBadge";

const sections: IDetailSection<IInventoryItem>[] = [
  {
    key: "stock",
    title: "Stock",
    icon: <Warehouse />,
    items: [
      {
        key: "on_hand",
        label: "On hand",
        render: (item) => (
          <span>
            <span className={onHandValue({ status: item.stock_status, size: "lg" })}>
              {formatNumber(item.on_hand)}
            </span>
            <span className={onHandUnit}>{item.unit}</span>
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (item) => (
          <StockStatusBadge status={item.stock_status} archived={item.archived_at !== null} />
        ),
      },
      { key: "reorder", label: "Warning low stock quantity", render: (item) => formatNumber(item.reorder_level) },
      { key: "location", label: "Shelf / location", render: (item) => item.location ?? "—" },
    ],
  },
  {
    key: "item",
    title: "Item",
    icon: <Info />,
    items: [
      { key: "code", label: "Item code", render: (item) => item.item_code },
      { key: "category", label: "Category", render: (item) => item.category?.name ?? "—" },
      { key: "brand", label: "Brand", render: (item) => item.brand?.name ?? "—" },
      {
        key: "price",
        label: "Selling price",
        render: (item) =>
          item.selling_price === null ? "—" : (
            <span className={priceText}>{formatPeso(item.selling_price)}</span>
          ),
      },
      { key: "updated", label: "Last updated", render: (item) => formatDateTime(item.updated_at) },
    ],
  },
];

const ItemDetailModal = () => {
  const { modal, closeModal } = useModal<IInventoryItem>(itemDetailModalKey);
  const stockModal = useStockMovementModal();
  const formModal = useModal<IInventoryItem>(itemFormModalKey);
  const { archive, restore } = useItemArchive();
  const { isOwner, viewMovements } = usePermissions();
  const item = modal.data;
  const history = useItemMovements(item?.id, modal.visible && viewMovements);
  const active = item ? item.archived_at === null : false;

  // One dialog at a time: the detail closes and the next dialog takes its place.
  const handOff = (next: (current: IInventoryItem) => void) => {
    if (!item) return;
    closeModal();
    next(item);
  };

  const startStock = (action: StockAction) =>
    handOff((current) => stockModal.openModal({ item: current, action }));

  const renderHistory = () => {
    if (history.isLoading) return <EmptyState loading description="Loading history…" />;
    if (history.isError) {
      return <ErrorState error={history.error} onRetry={() => void history.refetch()} />;
    }
    if (!history.data?.length) return <EmptyState description="No stock movements yet." />;

    return (
      <ul className={historyList}>
        {history.data.map((movement) => (
          <li key={movement.id} className={historyRow}>
            <span className={historyText}>
              <span className={itemName}>{movementReasonLabels[movement.reason]}</span>
              <span className={itemMeta}>
                {formatDateTime(movement.created_at)} · {movement.created_by_name}
                {movement.note ? ` · ${movement.note}` : ""}
              </span>
            </span>
            <span className={historyQuantity({ direction: movement.quantity > 0 ? "in" : "out" })}>
              {formatSignedQuantity(movement.quantity)}
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
      title={item?.name ?? "Item"}
      description={item?.item_code}
      size="lg"
      record={item}
      sections={sections}
      footer={
        isOwner && (
          <>
            {active ? (
              <AppButton tone="dangerSoft" onPress={() => handOff(archive)}>
                <Archive />
                Archive
              </AppButton>
            ) : (
              <AppButton variant="outline" onPress={() => handOff(restore)}>
                <ArchiveRestore />
                Restore
              </AppButton>
            )}
            <AppButton variant="outline" onPress={() => handOff(formModal.openModal)}>
              <Pencil />
              Edit item
            </AppButton>
          </>
        )
      }
      header={
        active && (
          <div className={detailActions}>
            {isOwner && (
              <AppButton onPress={() => startStock("stock_in")}>
                <PackagePlus />
                Add stock
              </AppButton>
            )}
            {isOwner && (
              <AppButton
                variant="outline"
                disabled={item?.on_hand === 0}
                onPress={() => startStock("stock_out")}
              >
                <PackageMinus />
                Deduct
              </AppButton>
            )}
          </div>
        )
      }
    >
      {viewMovements && (
        <section className={detailSection}>
          <div className={detailSectionHeader}>
            <History aria-hidden />
            <h3 className={sectionTitle}>Recent movements</h3>
          </div>
          {renderHistory()}
        </section>
      )}
    </DetailModal>
  );
};

export default ItemDetailModal;
