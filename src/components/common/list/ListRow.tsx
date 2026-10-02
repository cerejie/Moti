import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "react-aria-components";
import { cn } from "@/utils/cn.utils";
import {
  listRow,
  listRowAction,
  listRowChevron,
  listRowShell,
  listRowSubtitle,
  listRowText,
  listRowTitle,
  listRowTrailing,
  listRowWithAction,
} from "../../../styles/list/list.styles";

type IProps = {
  title: string;
  subtitle?: ReactNode;
  // Value or status on the right; stacked when it holds two lines.
  trailing?: ReactNode;
  // A row that opens something is one button and shows a chevron.
  onPress?: () => void;
  // A control of its own (Add, stepper, ⋮); kept outside the row button so a tap never opens the row.
  action?: ReactNode;
};

const ListRow = ({ title, subtitle, trailing, onPress, action }: IProps) => {
  const content = (
    <>
      <span className={listRowText}>
        <span className={listRowTitle}>{title}</span>
        {subtitle && <span className={listRowSubtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={listRowTrailing}>{trailing}</span>}
    </>
  );
  const rowClass = cn(listRow, action && listRowWithAction);

  const row = onPress ? (
    <Button onPress={onPress} className={rowClass}>
      {content}
      <ChevronRight aria-hidden className={listRowChevron} />
    </Button>
  ) : (
    <div className={rowClass}>{content}</div>
  );

  if (!action) return row;

  return (
    <div className={listRowShell}>
      {row}
      <span className={listRowAction}>{action}</span>
    </div>
  );
};

export default ListRow;
