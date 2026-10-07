import type { ReactNode } from "react";
import { Link } from "react-aria-components";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import {
  statAffix,
  statBody,
  statCaption,
  statCard,
  statChipRow,
  statHead,
  statHeading,
  statIcon,
  statLink,
  statSkeletonTitle,
  statSkeletonValue,
  statTitle,
  statValue,
} from "../../../styles/cards/statCard.styles";
import { toneChip, toneText, type Tone } from "../../../styles/common/tone.styles";
import { formatPeso } from "../../../utils/format.utils";
import ErrorState from "../status/ErrorState";

type IProps = {
  title: string;
  value: number | string | null | undefined;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  // Shows the value as given; otherwise a number is formatted as pesos.
  raw?: boolean;
  prefix?: ReactNode;
  unit?: string;
  variant?: Tone;
  icon?: ReactNode;
  chip?: ReactNode;
  caption?: ReactNode;
  href?: string;
  children?: ReactNode;
};

const formatValue = (value: IProps["value"], raw: boolean) => {
  if (value === null || value === undefined) return "—";
  if (raw || typeof value === "string") return value;
  return formatPeso(value);
};

const StatCard = ({
  title,
  value,
  loading,
  error,
  onRetry,
  raw = false,
  prefix,
  unit,
  variant = "neutral",
  icon,
  chip,
  caption,
  href,
  children,
}: IProps) => {
  if (loading) {
    return (
      <Card size="sm" className={statCard} aria-busy>
        <CardContent className={statBody}>
          <Skeleton className={statSkeletonTitle} />
          <Skeleton className={statSkeletonValue} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className={statCard}>
        <CardContent className={statBody}>
          <ErrorState compact error={error} title={`${title} unavailable`} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  const card = (
    <Card size="sm" className={statCard}>
      <CardContent className={statBody}>
        <div className={statHead}>
          <div className={statHeading}>
            <span className={statTitle}>{title}</span>
            <span className={cn(statValue, toneText({ tone: variant }))}>
              {prefix ? <span className={statAffix}>{prefix}</span> : null}
              {formatValue(value, raw)}
              {unit ? <span className={statAffix}>{unit}</span> : null}
            </span>
          </div>
          {icon ? (
            <span className={cn(statIcon, toneChip({ tone: variant }))} aria-hidden>
              {icon}
            </span>
          ) : null}
        </div>

        {chip ? <div className={statChipRow}>{chip}</div> : null}
        {caption ? <div className={statCaption}>{caption}</div> : null}
        {children}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className={statLink}>
      {card}
    </Link>
  );
};

export default StatCard;
