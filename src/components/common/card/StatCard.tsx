import type { ReactNode } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/utils/cn.utils";
import type { Tone } from "../../../styles/common/tone.styles";
import {
  statCardIcon,
  statCardLabel,
  statCardRoot,
  statCardTrailing,
  statCardValue,
} from "../../../styles/cards/statCard.styles";

type IProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: Tone;
  size?: "md" | "lg";
  // Affordance at the end of the tile, e.g. an "opens elsewhere" arrow.
  trailing?: ReactNode;
  // Sits under the value; the dashboard puts a status badge here.
  footer?: ReactNode;
  // Renders the whole tile as a link when given.
  to?: string;
  className?: string;
};

const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  size = "md",
  trailing,
  footer,
  to,
  className,
}: IProps) => {
  const content = (
    <>
      {icon && (
        <ItemMedia
          variant="icon"
          className={statCardIcon({ tone, size })}
          aria-hidden
        >
          {icon}
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle className={statCardLabel({ tone, size })}>{label}</ItemTitle>
        <span className={statCardValue({ size })}>{value}</span>
        {hint && <ItemDescription>{hint}</ItemDescription>}
        {footer}
      </ItemContent>
      {trailing && (
        <ItemActions className={statCardTrailing}>{trailing}</ItemActions>
      )}
    </>
  );

  const rootClassName = cn(statCardRoot({ tone, size }), className);

  // Item turns into a link only when href is present at all, so the prop is
  // left off rather than passed as undefined. The RouterProvider in AppShell
  // keeps the navigation client-side.
  if (to) {
    return (
      <Item variant="outline" className={rootClassName} href={to}>
        {content}
      </Item>
    );
  }

  return (
    <Item variant="outline" className={rootClassName}>
      {content}
    </Item>
  );
};

export default StatCard;
