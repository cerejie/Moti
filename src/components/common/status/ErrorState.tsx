import { AlertTriangle, RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tone } from "../../../styles/common/tone.styles";
import { describeError } from "../../../utils/error.utils";
import AppAlert from "./AppAlert";

type IProps = {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

const ErrorState = ({
  error,
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: IProps) => {
  const description = describeError(error, message);
  // Being offline is not the user's mistake, so it stays the softer warning tone.
  const tone: Tone = description.kind === "network" ? "warning" : "danger";

  return (
    <AppAlert
      tone={tone}
      icon={description.kind === "network" ? <WifiOff /> : <AlertTriangle />}
      title={title ?? description.title}
      actions={
        onRetry && (
          <Button type="button" variant="outline" size="sm" onPress={onRetry}>
            <RotateCw />
            {retryLabel}
          </Button>
        )
      }
      className={className}
    >
      <p>{description.message}</p>
    </AppAlert>
  );
};

export default ErrorState;
