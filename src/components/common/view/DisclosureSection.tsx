import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/utils/cn.utils";
import {
  disclosureChevron,
  disclosureContent,
  disclosureRoot,
  disclosureTrigger,
} from "../../../styles/view/disclosure.styles";

type IProps = {
  title: string;
  icon?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  children: ReactNode;
};

// React Aria's Disclosure: the trigger is a real button with aria-expanded, and keyboard-operable.
const DisclosureSection = ({ title, icon, defaultExpanded = false, className, children }: IProps) => (
  <Collapsible defaultExpanded={defaultExpanded} className={cn(disclosureRoot, className)}>
    <CollapsibleTrigger className={disclosureTrigger}>
      {icon}
      <span>{title}</span>
      <ChevronDown className={disclosureChevron} aria-hidden />
    </CollapsibleTrigger>
    {/* Padding lives inside: a closed panel is hidden "until-found" and would keep its own. */}
    <CollapsibleContent>
      <div className={disclosureContent}>{children}</div>
    </CollapsibleContent>
  </Collapsible>
);

export default DisclosureSection;
