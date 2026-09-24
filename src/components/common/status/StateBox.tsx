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
import { stateBox } from "../../../styles/state/state.styles";

type IProps = {
  tone?: "default" | "danger";
  loading?: boolean;
  icon?: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const StateBox = ({
  tone = "default",
  loading = false,
  icon,
  title,
  action,
  className,
  children,
}: IProps) => {
  const media = loading ? <Spinner /> : icon;

  return (
    <Empty className={cn(stateBox({ tone }), className)}>
      <EmptyHeader>
        {media && (
          <EmptyMedia variant={loading ? "default" : "icon"} aria-hidden>
            {media}
          </EmptyMedia>
        )}
        {title && <EmptyTitle>{title}</EmptyTitle>}
        {children && <EmptyDescription>{children}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
};

export default StateBox;
