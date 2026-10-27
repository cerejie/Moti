import { PackageMinus, PackagePlus } from "lucide-react";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
import { useStockMovementModal } from "../../../hook/data/movement/movement.form.hook";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  itemStockActions,
  itemStockBody,
  itemStockFigure,
  itemStockHint,
  itemStockLabel,
  itemStockTop,
  onHandUnit,
  onHandValue,
} from "../../../styles/inventory/inventory.styles";
import { formatNumber } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  item: IInventoryItem;
};

const ItemStockCard = ({ item }: IProps) => {
  const { isOwner } = usePermissions();
  const stockModal = useStockMovementModal();
  const archived = item.archived_at !== null;

  return (
    <SectionCard>
      <div className={itemStockBody}>
        <div className={itemStockTop}>
          <div className={itemStockFigure}>
            <span className={itemStockLabel}>On hand</span>
            <span>
              <span className={onHandValue({ status: item.stock_status, size: "xl" })}>
                {formatNumber(item.on_hand)}
              </span>
              <span className={onHandUnit}>{item.unit}</span>
            </span>
            <span className={itemStockHint}>
              Low stock warning at {formatNumber(item.reorder_level)} {item.unit}
            </span>
          </div>
          <StockStatusBadge status={item.stock_status} archived={archived} />
        </div>

        {isOwner && !archived && (
          <div className={itemStockActions}>
            <AppButton size="lg" onPress={() => stockModal.openModal({ item, action: "stock_in" })}>
              <PackagePlus data-icon="inline-start" aria-hidden />
              Add stock
            </AppButton>
            <AppButton
              size="lg"
              variant="outline"
              disabled={item.on_hand === 0}
              onPress={() => stockModal.openModal({ item, action: "stock_out" })}
            >
              <PackageMinus data-icon="inline-start" aria-hidden />
              Deduct
            </AppButton>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default ItemStockCard;
