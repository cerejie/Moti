import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn.utils";
import { tone as toneStyles, type Tone } from "../../../styles/common/tone.styles";
import {
  statusBadgeDot,
  statusBadgeRoot,
} from "../../../styles/status/badge.styles";

type IProps = {
  tone?: Tone;
  title?: string;
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

const StatusBadge = ({
  tone = "neutral",
  title,
  dot = false,
  className,
  children,
}: IProps) => {
  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(statusBadgeRoot, toneStyles({ tone }), className)}
    >
      {dot && <span className={statusBadgeDot} aria-hidden />}
      {children}
    </Badge>
  );
};

export default StatusBadge;
