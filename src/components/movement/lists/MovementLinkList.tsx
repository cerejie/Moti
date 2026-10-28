import { ChevronRight, Package, ReceiptText } from "lucide-react";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import { movementLinkChevron, movementLinkIcon } from "../../../styles/movement/movement.styles";
import {
  detailPageList,
  detailPageRow,
  detailPageRowText,
} from "../../../styles/view/detailPage.styles";
import { itemPath, transactionPath } from "../../../utils/route.utils";
import RowLink from "../../common/view/RowLink";

type IProps = {
  movement: IStockMovement;
};

const MovementLinkList = ({ movement }: IProps) => (
  <ul className={detailPageList}>
    <li className={detailPageRow}>
      <span className={movementLinkIcon} aria-hidden>
        <Package />
      </span>
      <RowLink href={itemPath(movement.item_id)} className={detailPageRowText}>
        <span className={itemName}>{movement.item?.name ?? "Deleted item"}</span>
        <span className={itemMeta}>Open item</span>
      </RowLink>
      <ChevronRight className={movementLinkChevron} aria-hidden />
    </li>
    {movement.transaction_id && (
      <li className={detailPageRow}>
        <span className={movementLinkIcon} aria-hidden>
          <ReceiptText />
        </span>
        <RowLink href={transactionPath(movement.transaction_id)} className={detailPageRowText}>
          <span className={itemName}>Transaction</span>
          <span className={itemMeta}>Open the sale</span>
        </RowLink>
        <ChevronRight className={movementLinkChevron} aria-hidden />
      </li>
    )}
  </ul>
);

export default MovementLinkList;
