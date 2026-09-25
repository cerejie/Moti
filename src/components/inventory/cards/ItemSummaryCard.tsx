import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import StatCard from "../../common/card/StatCard";
import StatusBadge from "../../common/status/StatusBadge";
import { stockStatusLabels, stockStatusTones } from "../../../enums/inventory.enum";
import { useItemArchive, useItemFormModal } from "../../../hook/data/inventory/inventory.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { formatPeso } from "../../../utils/format.utils";
import StockActions from "../../movement/panels/StockActions";
import {
  inventoryActions,
  itemStats,
  itemSummaryHeader,
  itemSummaryMeta,
} from "../../../styles/inventory/inventory.styles";

type IProps = {
  item: IInventoryItem;
  canManage: boolean;
};

const ItemSummaryCard = ({ item, canManage }: IProps) => {
  const { openEdit } = useItemFormModal();
  const { archive, restore, isPending } = useItemArchive();

  const actions = canManage ? (
    <div className={inventoryActions}>
      <AppButton variant="outline" onPress={() => openEdit(item)}>
        <Pencil />
        Edit
      </AppButton>
      {item.archived_at ? (
        <AppButton variant="outline" loading={isPending} onPress={() => restore(item)}>
          <ArchiveRestore />
          Restore
        </AppButton>
      ) : (
        <AppButton variant="outline" onPress={() => archive(item)}>
          <Archive />
          Archive
        </AppButton>
      )}
    </div>
  ) : undefined;

  return (
    <SectionCard title={item.name} actions={actions}>
      <div className={itemSummaryHeader}>
        <StatusBadge tone={stockStatusTones[item.stock_status]} dot>
          {stockStatusLabels[item.stock_status]}
        </StatusBadge>
        {item.archived_at && <StatusBadge tone="neutral">Archived</StatusBadge>}
        <span className={itemSummaryMeta}>{item.item_code}</span>
      </div>

      <div className={itemStats}>
        <StatCard
          label="On hand"
          value={`${item.on_hand} ${item.unit}`}
          tone={stockStatusTones[item.stock_status]}
        />
        <StatCard label="Reorder level" value={item.reorder_level} />
        <StatCard
          label="Selling price"
          value={item.selling_price === null ? "—" : formatPeso(item.selling_price)}
        />
        <StatCard label="Location" value={item.location ?? "—"} />
      </div>

      <StockActions item={item} />
    </SectionCard>
  );
};

export default ItemSummaryCard;
