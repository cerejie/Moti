import { PackageX } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import AppAlert from "../../common/status/AppAlert";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import { useInventoryItem } from "../../../hook/data/inventory/inventory.list.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { ROUTES } from "../../../routes/route.paths";
import { formatDateTime } from "../../../utils/format.utils";
import { detailGrid, detailItem } from "../../../styles/modal/detail.styles";
import { detailLabel, detailValue } from "../../../styles/common/typography.styles";
import { itemDetailStack } from "../../../styles/inventory/inventory.styles";
import ItemMovementsCard from "../../movement/cards/ItemMovementsCard";
import ItemSummaryCard from "../cards/ItemSummaryCard";

const detailRows = (item: IInventoryItem) => [
  { label: "Category", value: item.category_name },
  { label: "Brand", value: item.brand },
  { label: "Part number", value: item.part_number },
  { label: "Fits", value: item.fitment },
  { label: "Unit", value: item.unit },
  { label: "Last updated", value: formatDateTime(item.updated_at) },
];

const ItemDetailPanel = () => {
  const { data: item, isLoading, isError, error, refetch, canManage } = useInventoryItem();

  if (isLoading) return <StateBox loading>Loading item…</StateBox>;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (!item) {
    return (
      <StateBox
        icon={<PackageX />}
        title="Item not found"
        action={
          <AppButton variant="outline" href={ROUTES.inventory}>
            Back to inventory
          </AppButton>
        }
      >
        It may have been removed, or it belongs to another shop.
      </StateBox>
    );
  }

  return (
    <div className={itemDetailStack}>
      {item.archived_at && (
        <AppAlert tone="warning" title="Archived">
          This item is hidden from the inventory list and can't be sold or restocked until it
          is restored.
        </AppAlert>
      )}

      <ItemSummaryCard item={item} canManage={canManage} />

      <SectionCard title="Details">
        <dl className={detailGrid}>
          {detailRows(item).map((row) => (
            <div key={row.label} className={detailItem}>
              <dt className={detailLabel}>{row.label}</dt>
              <dd className={detailValue}>{row.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <ItemMovementsCard itemId={item.id} />
    </div>
  );
};

export default ItemDetailPanel;
