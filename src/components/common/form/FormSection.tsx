import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  formSection,
  formSectionChevron,
  formSectionDisclosure,
  formSectionHeader,
  formSectionHeaderToggle,
  formSectionPanelBody,
  formSectionTitle,
  formSectionToggle,
} from "../../../styles/form/formSection.styles";

type IProps = {
  title: string;
  description?: string;
  // Folds the section behind its title; EntityFormModal turns it on for compact forms.
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?: ReactNode;
};

const FormSection = ({
  title,
  description,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  children,
}: IProps) => {
  const body = (
    <CardContent className={collapsible ? formSectionPanelBody : undefined}>
      {children}
    </CardContent>
  );

  if (!collapsible) {
    return (
      <Card className={formSection}>
        <CardHeader className={formSectionHeader}>
          <CardTitle className={formSectionTitle}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {body}
      </Card>
    );
  }

  return (
    <Card className={formSection}>
      <Collapsible
        className={formSectionDisclosure}
        isExpanded={expanded}
        onExpandedChange={onExpandedChange}
      >
        <CardHeader className={formSectionHeaderToggle}>
          <CollapsibleTrigger className={formSectionToggle}>
            <span className={formSectionTitle}>{title}</span>
            <ChevronDown className={formSectionChevron} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>{body}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormSection;
