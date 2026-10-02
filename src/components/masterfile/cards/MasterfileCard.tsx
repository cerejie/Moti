import type { ReactNode } from "react";
import { itemIdentity, itemMeta, itemName } from "../../../styles/inventory/inventory.styles";
import { masterfileCard } from "../../../styles/masterfile/masterfile.styles";
import { formatCount, formatShortDate } from "../../../utils/format.utils";

type IProps = {
  name: string;
  itemCount: number;
  createdAt: string;
  actions: ReactNode;
};

// Phone row for a category or brand.
const MasterfileCard = ({ name, itemCount, createdAt, actions }: IProps) => (
  <article className={masterfileCard}>
    <span className={itemIdentity}>
      <span className={itemName}>{name}</span>
      <span className={itemMeta}>
        {formatCount(itemCount, "item")} · Added {formatShortDate(createdAt)}
      </span>
    </span>
    {actions}
  </article>
);

export default MasterfileCard;
