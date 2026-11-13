import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { onHandUnit, onHandValue } from "../../../styles/inventory/inventory.styles";
import {
  detailHeroBody,
  detailHeroFigure,
  detailHeroHint,
  detailHeroLabel,
  detailHeroTop,
} from "../../../styles/view/detailPage.styles";
import { formatNumber } from "../../../utils/format.utils";
import SectionCard from "../../common/card/SectionCard";
import StockActions from "../../movement/menus/StockActions";
import StockStatusBadge from "../status/StockStatusBadge";

type IProps = {
  item: IInventoryItem;
};

const ItemStockCard = ({ item }: IProps) => {
  const archived = item.archived_at !== null;

  return (
    <SectionCard>
      <div className={detailHeroBody}>
        <div className={detailHeroTop}>
          <div className={detailHeroFigure}>
            <span className={detailHeroLabel}>On hand</span>
            <span>
              <span className={onHandValue({ status: item.stock_status, size: "xl" })}>
                {formatNumber(item.on_hand)}
              </span>
              <span className={onHandUnit}>{item.unit}</span>
            </span>
            <span className={detailHeroHint}>
              Low stock warning at {formatNumber(item.reorder_level)} {item.unit}
            </span>
          </div>
          <StockStatusBadge status={item.stock_status} archived={archived} />
        </div>

        {!archived && <StockActions item={item} />}
      </div>
    </SectionCard>
  );
};

export default ItemStockCard;
