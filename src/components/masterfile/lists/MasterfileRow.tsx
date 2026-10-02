import type { ReactNode } from "react";
import { listRowNote } from "../../../styles/list/list.styles";
import { formatCount, formatShortDate } from "../../../utils/format.utils";
import ListRow from "../../common/list/ListRow";

type IProps = {
  name: string;
  itemCount: number;
  createdAt: string;
  action: ReactNode;
};

// Phone row for a category or brand; no sheet exists, so the ⋮ menu stays on the row.
const MasterfileRow = ({ name, itemCount, createdAt, action }: IProps) => (
  <ListRow
    title={name}
    subtitle={`Added ${formatShortDate(createdAt)}`}
    trailing={<span className={listRowNote()}>{formatCount(itemCount, "item")}</span>}
    action={action}
  />
);

export default MasterfileRow;
