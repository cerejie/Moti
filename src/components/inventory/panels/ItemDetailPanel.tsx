import { useParams } from "react-router-dom";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useInventoryItem } from "../../../hook/data/inventory/inventory.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { priceText } from "../../../styles/inventory/inventory.styles";
import {
  detailPage,
  detailPageHeading,
  detailPageMeta,
  detailPageSurface,
  detailPageTitle,
} from "../../../styles/view/detailPage.styles";
import { formatDateTime, formatPeso } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageSection from "../../common/view/DetailPageSection";
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
    <div className={detailPage}>
      <div className={detailPageHeading}>
        <h1 className={detailPageTitle}>{item.name}</h1>
        <p className={detailPageMeta}>
          {[item.item_code, item.brand?.name].filter(Boolean).join(" · ")}
        </p>
      </div>

      <ItemStockCard item={item} />

      <DetailPageSection title="Details">
        <div className={detailPageSurface}>
          <DetailRows record={item} items={detailItems} />
        </div>
      </DetailPageSection>

      {viewMovements && (
        <DetailPageSection title="Recent movements">
          <ItemMovementList itemId={item.id} />
        </DetailPageSection>
      )}

      {isOwner && (
        <DetailPageSection title="Manage">
          <ItemManageActions item={item} />
        </DetailPageSection>
      )}
    </div>
  );
};

export default ItemDetailPanel;
