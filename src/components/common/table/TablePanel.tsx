import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import {
  tablePanelBody,
  tablePanelRoot,
  tablePanelToolbar,
} from "../../../styles/table/tablePanel.styles";
import SectionCard from "../card/SectionCard";

type IProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  // Filter row, rendered between the header and the table.
  toolbar?: ReactNode;
  // Pagination, rendered flush to the bottom of the card.
  footer?: ReactNode;
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
};

const TablePanel = ({
  title,
  description,
  actions,
  toolbar,
  footer,
  bordered,
  className,
  children,
}: IProps) => {
  return (
    <SectionCard
      padded={false}
      bordered={bordered}
      title={title}
      description={description}
      actions={actions}
      className={cn(tablePanelRoot, className)}
    >
      {toolbar && <div className={tablePanelToolbar}>{toolbar}</div>}

      <div className={tablePanelBody}>{children}</div>

      {footer}
    </SectionCard>
  );
};

export default TablePanel;
