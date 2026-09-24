import type { ComponentProps, ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn.utils";
import {
  buttonTone,
  type IButtonTone,
} from "../../../styles/button/button.styles";
import AppTooltip from "../view/AppTooltip";

type IProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "isDisabled"
> & {
  tone?: IButtonTone;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  // Renders a link styled as this button. In-app paths route client-side
  // through the RouterProvider in AppShell.
  href?: string;
  target?: string;
  rel?: string;
};

const AppButton = ({
  tone,
  loading = false,
  disabled,
  className,
  children,
  href,
  target,
  rel,
  ...props
}: IProps) => {
  const isDisabled = disabled || loading;
  const classes = cn(buttonTone({ tone }), className);

  const button =
    href === undefined ? (
      <Button {...props} isDisabled={isDisabled} className={classes}>
        {loading && <Spinner />}
        {children}
      </Button>
    ) : (
      <LinkButton
        href={href}
        target={target}
        rel={rel}
        variant={props.variant}
        size={props.size}
        aria-label={props["aria-label"]}
        isDisabled={isDisabled}
        className={classes}
      >
        {children}
      </LinkButton>
    );

  // An icon-only button names itself through aria-label; the same text is
  // shown as a tooltip so sighted pointer users get it too.
  const iconOnly = props.size?.startsWith("icon") ?? false;
  const label = props["aria-label"];

  return iconOnly && label ? (
    <AppTooltip label={label}>{button}</AppTooltip>
  ) : (
    button
  );
};

export default AppButton;
