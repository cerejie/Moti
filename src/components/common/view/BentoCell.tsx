import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import type { BentoSpan } from "../../../models/common/view.model";
import { bentoCell } from "../../../styles/view/bento.styles";

type IProps = {
  span?: BentoSpan;
  className?: string;
  children?: ReactNode;
};

const BentoCell = ({ span = "full", className, children }: IProps) => {
  return <div className={cn(bentoCell({ span }), className)}>{children}</div>;
};

export default BentoCell;
