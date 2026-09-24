import type { ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/utils/cn.utils";
import { tone as toneStyles, type Tone } from "../../../styles/common/tone.styles";
import {
  appAlertActions,
  appAlertDescription,
  appAlertDismiss,
} from "../../../styles/status/alert.styles";

const defaultIcon: Record<Tone, ReactNode> = {
  neutral: <Info />,
  brand: <Info />,
  info: <Info />,
  success: <CheckCircle2 />,
  warning: <TriangleAlert />,
  danger: <CircleAlert />,
};

type IProps = {
  tone?: Tone;
  title?: ReactNode;
  // Pass null to render without an icon.
  icon?: ReactNode;
  // Buttons rendered under the text, e.g. retry.
  actions?: ReactNode;
  // An icon-only button pinned to the top-right corner, e.g. close.
  dismiss?: ReactNode;
  // Announces to assistive tech as a live status rather than an alert.
  status?: boolean;
  className?: string;
  children?: ReactNode;
};

const AppAlert = ({
  tone = "neutral",
  title,
  icon,
  actions,
  dismiss,
  status = false,
  className,
  children,
}: IProps) => {
  const media = icon === undefined ? defaultIcon[tone] : icon;

  return (
    <Alert
      role={status ? "status" : "alert"}
      className={cn(toneStyles({ tone }), appAlertDescription({ tone }), className)}
    >
      {media}
      {title && <AlertTitle>{title}</AlertTitle>}
      {children && <AlertDescription>{children}</AlertDescription>}
      {actions && <div className={appAlertActions}>{actions}</div>}
      {dismiss && <div className={appAlertDismiss}>{dismiss}</div>}
    </Alert>
  );
};

export default AppAlert;
