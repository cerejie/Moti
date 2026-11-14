import { useParams } from "react-router-dom";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import { useInventoryItem } from "../../../hook/data/inventory/inventory.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { detailPageSurface } from "../../../styles/view/detailPage.styles";
import { formatDateTime } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageLayout from "../../common/view/DetailPageLayout";
import DetailPageSection from "../../common/view/DetailPageSection";
import ItemSalesPaceCard from "../cards/ItemSalesPaceCard";
import ItemStockCard from "../cards/ItemStockCard";
import ItemBranchStockList from "../lists/ItemBranchStockList";
import ItemMovementList from "../lists/ItemMovementList";
import ItemManageActions from "../menus/ItemManageActions";

// The item code already sits under the title, so it is not repeated here.
const detailItems: IDetailItem<IInventoryItem>[] = [
  { key: "category", label: "Category", render: (item) => item.category?.name ?? "—" },
  { key: "brand", label: "Brand", render: (item) => item.brand?.name ?? "—" },
  { key: "location", label: "Shelf / location", render: (item) => item.location ?? "—" },
  { key: "updated", label: "Last updated", render: (item) => formatDateTime(item.updated_at) },
];

const ItemDetailPanel = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const query = useInventoryItem(itemId);
  const { isOwner, viewMovements } = usePermissions();
  const { multiple } = useActiveBranch();
  const item = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading product…" />;
  if (!item) {
    return (
      <ErrorState error={query.error} title="Product not found" onRetry={() => void query.refetch()} />
    );
  }

  return (
    <DetailPageLayout
      title={item.name}
      meta={[item.item_code, item.brand?.name].filter(Boolean).join(" · ")}
      aside={
        <>
          {isOwner && (
            <DetailPageSection title="Sales pace">
              <ItemSalesPaceCard itemId={item.id} />
            </DetailPageSection>
          )}

          <DetailPageSection title="Details">
            <div className={detailPageSurface}>
              <DetailRows record={item} items={detailItems} />
            </div>
          </DetailPageSection>

          {/* Edit and Archive sit last, apart from everyday stock work. */}
          {isOwner && (
            <DetailPageSection title="Manage product">
              <ItemManageActions item={item} />
            </DetailPageSection>
          )}
        </>
      }
    >
      <ItemStockCard item={item} pending={query.isPlaceholderData} />

      {multiple && (
        <DetailPageSection title="By branch">
          <ItemBranchStockList item={item} />
        </DetailPageSection>
      )}

      {viewMovements && (
        <DetailPageSection title="Recent stock history">
          <ItemMovementList itemId={item.id} />
        </DetailPageSection>
      )}
    </DetailPageLayout>
  );
};

export default ItemDetailPanel;
