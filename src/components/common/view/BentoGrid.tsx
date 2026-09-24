import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import { bentoGrid } from "../../../styles/view/bento.styles";

type IProps = {
  className?: string;
  children?: ReactNode;
};

const BentoGrid = ({ className, children }: IProps) => {
  return <div className={cn(bentoGrid, className)}>{children}</div>;
};

export default BentoGrid;
