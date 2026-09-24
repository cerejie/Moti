import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn.utils";
import type { CardTone } from "../../../models/common/view.model";
import {
  sectionCardActions,
  sectionCardBody,
  sectionCardFill,
  sectionCardFlush,
  sectionCardFooter,
  sectionCardHeader,
  sectionCardInset,
  sectionCardRoot,
} from "../../../styles/cards/card.styles";
import { cardTitle } from "../../../styles/common/typography.styles";

type IProps = {
  title?: string;
  // Names a card that has no visible title, so it still reads as a region.
  ariaLabel?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: CardTone;
  // shadcn's compact card: tighter spacing all round for a small inset block.
  size?: "default" | "sm";
  // Unpadded lets a table or map sit flush to the card edge.
  padded?: boolean;
  // Borderless drops the outline ring for cards that sit on a white page.
  bordered?: boolean;
  // The body takes the card's spare height rather than only its content's.
  fill?: boolean;
  // Takes the card out of reach - no clicks, no focus - while something else
  // on the screen holds the user.
  inert?: boolean;
  className?: string;
  children?: ReactNode;
};

const SectionCard = ({
  title,
  ariaLabel,
  description,
  actions,
  footer,
  tone = "surface",
  size = "default",
  padded = true,
  bordered = true,
  fill = false,
  inert,
  className,
  children,
}: IProps) => {
  const hasHeader = Boolean(title || description || actions);
  const inset = padded ? undefined : sectionCardInset;

  return (
    <Card
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      size={size}
      className={cn(sectionCardRoot({ tone, padded, bordered }), className)}
      inert={inert}
    >
      {hasHeader && (
        <CardHeader className={cn(sectionCardHeader, inset)}>
          {title && <CardTitle className={cardTitle}>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {actions && (
            <CardAction className={sectionCardActions}>{actions}</CardAction>
          )}
        </CardHeader>
      )}

      <CardContent
        className={cn(
          sectionCardBody,
          fill && sectionCardFill,
          !padded && sectionCardFlush,
        )}
      >
        {children}
      </CardContent>

      {footer && (
        <CardFooter className={cn(sectionCardFooter, inset)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default SectionCard;
