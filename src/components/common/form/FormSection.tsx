import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import {
  formSectionDescription,
  formSectionHeader,
  formSectionRoot,
} from "../../../styles/form/formSection.styles";
import { sectionTitle } from "../../../styles/common/typography.styles";

type IProps = {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

const FormSection = ({ title, description, className, children }: IProps) => {
  return (
    <section className={cn(formSectionRoot, className)}>
      {(title || description) && (
        <div className={formSectionHeader}>
          {title && <h3 className={sectionTitle}>{title}</h3>}
          {description && (
            <p className={formSectionDescription}>{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default FormSection;
