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
  statCardValueLoading,
} from "../../../styles/cards/statCard.styles";
import LoadingBar from "../status/LoadingBar";

type IProps = {
  label: string;
  value: ReactNode;
  // Label and icon stay; only the value is a placeholder until it arrives.
  loading?: boolean;
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
  // Runs before the link navigates, e.g. to preset the target page's filters.
  onPress?: () => void;
  className?: string;
};

const StatCard = ({
  label,
  value,
  loading = false,
  hint,
  icon,
  tone = "neutral",
  size = "md",
  trailing,
  footer,
  to,
  onPress,
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
        {loading ? (
          <LoadingBar className={statCardValueLoading} />
        ) : (
          <span className={statCardValue({ size })}>{value}</span>
        )}
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
      <Item variant="outline" className={rootClassName} href={to} onPress={onPress}>
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
