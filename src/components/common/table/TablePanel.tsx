import type { ReactNode } from "react";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import {
  tablePanelBody,
  tablePanelFlat,
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
  const isMobile = useIsMobile();

  // On a phone the row cards sit on the page background like a native list,
  // so the panel frame (and its header, unused on phones today) is dropped.
  if (isMobile) {
    return (
      <section className={cn(tablePanelFlat, className)}>
        {toolbar}
        {children}
        {footer}
      </section>
    );
  }

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
