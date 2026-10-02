import type { ReactNode } from "react";
import { listGroup } from "../../../styles/list/list.styles";

type IProps = {
  label: string;
  busy?: boolean;
  // `<li>` elements, each holding a ListRow.
  children: ReactNode;
};

const ListGroup = ({ label, busy = false, children }: IProps) => (
  <ul aria-label={label} aria-busy={busy} className={listGroup}>
    {children}
  </ul>
);

export default ListGroup;
