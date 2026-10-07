import type { ReactNode } from "react";
import { RotateCw, TriangleAlert, WifiOff } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { errorState, errorStateMedia } from "../../../styles/status/status.styles";
import { describeError } from "../../../utils/error.utils";
import AppButton from "../button/AppButton";

type IProps = {
  error?: unknown;
  title?: string;
  message?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  // A tight block for inside a card, a tile or a form.
  compact?: boolean;
  className?: string;
};

const ErrorState = ({
  error,
  title,
  message,
  icon = <TriangleAlert />,
  onRetry,
  retryLabel = "Try again",
  compact = false,
  className,
}: IProps) => {
  const description = describeError(error, message);
  const offline = description.kind === "network";

  return (
    <Empty role="alert" className={errorState({ compact, className })}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={errorStateMedia({ offline })} aria-hidden>
          {offline ? <WifiOff /> : icon}
        </EmptyMedia>
        <EmptyTitle>{title ?? description.title}</EmptyTitle>
        <EmptyDescription>{description.message}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <AppButton variant="outline" size="sm" onPress={onRetry}>
            <RotateCw aria-hidden />
            {retryLabel}
          </AppButton>
        </EmptyContent>
      ) : null}
    </Empty>
  );
};

export default ErrorState;
