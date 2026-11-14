import type { ReactNode } from "react";
import {
  tablePanel,
  tablePanelBody,
  tablePanelTitle,
} from "../../../styles/table/table.styles";

type IProps = {
  title?: string;
  // Switches and the FilterToolbar, stacked above the table.
  toolbar?: ReactNode;
  footer?: ReactNode;
  // In a fill page: take the height left, so the DataTable inside scrolls its rows alone.
  fill?: boolean;
  children: ReactNode;
};

const TablePanel = ({ title, toolbar, footer, fill = false, children }: IProps) => {
  return (
    <div className={tablePanel({ fill })}>
      {title ? <h2 className={tablePanelTitle}>{title}</h2> : null}
      {toolbar}

      <div className={tablePanelBody({ fill })}>{children}</div>

      {footer}
    </div>
  );
};

export default TablePanel;
