import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
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
  // The row shown is a cached one that may hold another branch's count.
  pending: boolean;
};

const ItemStockCard = ({ item, pending }: IProps) => {
  const archived = item.archived_at !== null;
  const { writeBranch, multiple } = useActiveBranch();
  // One branch needs no name; with more, the figure says whose it is.
  const scope = multiple ? (writeBranch?.name ?? "All branches") : null;

  return (
    <SectionCard>
      <div className={detailHeroBody}>
        <div className={detailHeroTop}>
          <div className={detailHeroFigure}>
            <span className={detailHeroLabel}>{scope ? `Available · ${scope}` : "Available"}</span>
            <span>
              <span className={onHandValue({ status: item.stock_status, size: "xl" })}>
                {formatNumber(item.on_hand)}
              </span>
              <span className={onHandUnit}>{item.unit}</span>
            </span>
            <span className={detailHeroHint}>
              Low-stock alert at {formatNumber(item.reorder_level)} {item.unit}
            </span>
          </div>
          <StockStatusBadge status={item.stock_status} archived={archived} />
        </div>

        {!archived && <StockActions item={item} disabled={pending} />}
      </div>
    </SectionCard>
  );
};

export default ItemStockCard;
