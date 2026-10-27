import { useParams } from "react-router-dom";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useInventoryItem } from "../../../hook/data/inventory/inventory.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemDetailHeading,
  itemDetailMeta,
  itemDetailPage,
  itemDetailSection,
  itemDetailSectionTitle,
  itemDetailSurface,
  itemDetailTitle,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { formatDateTime, formatPeso } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import ItemStockCard from "../cards/ItemStockCard";
import ItemMovementList from "../lists/ItemMovementList";
import ItemManageActions from "../menus/ItemManageActions";

// The item code already sits under the title, so it is not repeated here.
const detailItems: IDetailItem<IInventoryItem>[] = [
  {
    key: "price",
    label: "Selling price",
    render: (item) =>
      item.selling_price === null ? "—" : (
        <span className={priceText}>{formatPeso(item.selling_price)}</span>
      ),
  },
  { key: "category", label: "Category", render: (item) => item.category?.name ?? "—" },
  { key: "brand", label: "Brand", render: (item) => item.brand?.name ?? "—" },
  { key: "location", label: "Shelf / location", render: (item) => item.location ?? "—" },
  { key: "updated", label: "Last updated", render: (item) => formatDateTime(item.updated_at) },
];

const ItemDetailPanel = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const query = useInventoryItem(itemId);
  const { isOwner, viewMovements } = usePermissions();
  const item = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading item…" />;
  if (!item) {
    return (
      <ErrorState error={query.error} title="Item not found" onRetry={() => void query.refetch()} />
    );
  }

  return (
    <div className={itemDetailPage}>
      <div className={itemDetailHeading}>
        <h1 className={itemDetailTitle}>{item.name}</h1>
        <p className={itemDetailMeta}>
          {[item.item_code, item.brand?.name].filter(Boolean).join(" · ")}
        </p>
      </div>

      <ItemStockCard item={item} />

      <section className={itemDetailSection}>
        <h2 className={itemDetailSectionTitle}>Details</h2>
        <div className={itemDetailSurface}>
          <DetailRows record={item} items={detailItems} />
        </div>
      </section>

      {viewMovements && (
        <section className={itemDetailSection}>
          <h2 className={itemDetailSectionTitle}>Recent movements</h2>
          <ItemMovementList itemId={item.id} />
        </section>
      )}

      {isOwner && (
        <section className={itemDetailSection}>
          <h2 className={itemDetailSectionTitle}>Manage</h2>
          <ItemManageActions item={item} />
        </section>
      )}
    </div>
  );
};

export default ItemDetailPanel;
