import { PackagePlus } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import { itemDetailModalKey } from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemCard,
  itemCardActions,
  itemCardBottom,
  itemCardOpen,
  itemCardStock,
  itemCardTop,
  itemIdentity,
  itemMeta,
  itemName,
  onHandUnit,
  onHandValue,
  priceText,
} from "../../../styles/inventory/inventory.styles";
import { formatNumber, formatPeso } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import InventoryRowActions from "../menus/InventoryRowActions";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  item: IInventoryItem;
};

// The phone row: the on-hand figure is big and "Add stock" is one thumb-tap away.
const InventoryItemCard = ({ item }: IProps) => {
  const { isOwner } = usePermissions();
  const stockModal = useStockMovementModal();
  const detailModal = useModal<IInventoryItem>(itemDetailModalKey);
  const archived = item.archived_at !== null;
  const meta = [item.sku, item.brand?.name, item.category?.name].filter(Boolean).join(" · ");

  return (
    <article className={itemCard}>
      <div className={itemCardTop}>
        <AppButton
          variant="ghost"
          className={itemCardOpen}
          aria-label={`View ${item.name}`}
          onPress={() => detailModal.openModal(item)}
        >
          <span className={itemIdentity}>
            <span className={itemName}>{item.name}</span>
            <span className={itemMeta}>{meta}</span>
          </span>
        </AppButton>
        <InventoryRowActions item={item} />
      </div>

      <div className={itemCardBottom}>
        <div className={itemCardStock}>
          <span className={onHandValue({ status: item.stock_status, size: "lg" })}>
            {formatNumber(item.on_hand)}
          </span>
          <span className={onHandUnit}>{item.unit}</span>
        </div>
        <StockStatusBadge status={item.stock_status} archived={archived} />
      </div>

      <div className={itemCardBottom}>
        <span className={priceText}>
          {item.selling_price === null ? "No price set" : formatPeso(item.selling_price)}
        </span>
        <div className={itemCardActions}>
          {isOwner && !archived && (
            <AppButton
              size="lg"
              variant="outline"
              onPress={() => stockModal.openModal({ item, action: "stock_in" })}
            >
              <PackagePlus />
              Add stock
            </AppButton>
          )}
        </div>
      </div>
    </article>
  );
};

export default InventoryItemCard;
