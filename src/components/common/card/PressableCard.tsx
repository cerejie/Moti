import type { ReactNode } from "react";
import { Button } from "react-aria-components";
import { cn } from "@/utils/cn.utils";
import { pressableCard } from "../../../styles/cards/card.styles";

type IProps = {
  "aria-label": string;
  onPress: () => void;
  className?: string;
  children: ReactNode;
};

const PressableCard = ({ className, children, ...props }: IProps) => (
  <Button {...props} className={cn(pressableCard, className)}>
    {children}
  </Button>
);

export default PressableCard;
