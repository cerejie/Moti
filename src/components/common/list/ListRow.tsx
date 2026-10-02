import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "react-aria-components";
import {
  listRow,
  listRowChevron,
  listRowSubtitle,
  listRowText,
  listRowTitle,
  listRowTrailing,
} from "../../../styles/list/list.styles";

type IProps = {
  title: string;
  subtitle?: ReactNode;
  // Value or status on the right; stacked when it holds two lines.
  trailing?: ReactNode;
  // A row that opens something is one button and shows a chevron.
  onPress?: () => void;
};

const ListRow = ({ title, subtitle, trailing, onPress }: IProps) => {
  const content = (
    <>
      <span className={listRowText}>
        <span className={listRowTitle}>{title}</span>
        {subtitle && <span className={listRowSubtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={listRowTrailing}>{trailing}</span>}
    </>
  );

  if (!onPress) return <div className={listRow}>{content}</div>;

  return (
    <Button onPress={onPress} className={listRow}>
      {content}
      <ChevronRight aria-hidden className={listRowChevron} />
    </Button>
  );
};

export default ListRow;
