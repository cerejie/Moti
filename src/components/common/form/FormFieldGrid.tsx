import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import { formFieldGrid } from "../../../styles/form/formSection.styles";

type IProps = {
  className?: string;
  children?: ReactNode;
};

const FormFieldGrid = ({ className, children }: IProps) => {
  return <div className={cn(formFieldGrid, className)}>{children}</div>;
};

export default FormFieldGrid;
