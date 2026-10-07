import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn.utils";
import { emptyLine, emptyState } from "../../../styles/status/status.styles";

type IProps = {
  title?: string;
  description?: ReactNode;
  loading?: boolean;
  // A single line with no box, for an empty state above or beside other content.
  compact?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const EmptyState = ({
  title,
  description,
  loading = false,
  compact = false,
  icon,
  action,
  className,
}: IProps) => {
  if (compact) {
    return (
      <p className={cn(emptyLine, className)}>
        {loading ? <Spinner /> : icon}
        {title ?? description}
      </p>
    );
  }

  if (loading) {
    return (
      <Empty className={cn(emptyState, className)} aria-busy>
        <Spinner />
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </Empty>
    );
  }

  return (
    <Empty className={cn(emptyState, className)}>
      <EmptyHeader>
        {icon ? (
          <EmptyMedia variant="icon" aria-hidden>
            {icon}
          </EmptyMedia>
        ) : null}
        {title ? <EmptyTitle>{title}</EmptyTitle> : null}
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
};

export default EmptyState;
