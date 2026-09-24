import type { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/utils/cn.utils";
import {
  viewTabsBar,
  viewTabsContent,
  viewTabsList,
  viewTabsListInline,
  viewTabsTrigger,
} from "../../../styles/view/tabs.styles";

export type IViewTabVariant = "underline" | "chip";

export type IViewTab = {
  key: string;
  label: ReactNode;
  content: ReactNode;
  // Per-tab tint on the trigger, e.g. a done state on a checklist chip.
  triggerClassName?: string;
};

type IProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: IViewTab[];
  label: string;
  variant?: IViewTabVariant;
  className?: string;
  // Overrides the panel inset, e.g. to sit a card straight under the list.
  contentClassName?: string;
  // Sits on the same row as the tab list, e.g. a panel's primary action.
  actions?: ReactNode;
};

const ViewTabs = ({
  value,
  onValueChange,
  tabs,
  label,
  variant = "underline",
  className,
  contentClassName,
  actions,
}: IProps) => {

  const list = (
    <TabsList
      aria-label={label}
      variant="line"
      className={cn(viewTabsList({ variant }), actions && viewTabsListInline)}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.key}
          id={tab.key}
          className={cn(viewTabsTrigger({ variant }), tab.triggerClassName)}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => onValueChange(String(key))}
      className={className}
    >
      {actions ? (
        <div className={viewTabsBar}>
          {list}
          {actions}
        </div>
      ) : (
        list
      )}

      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          id={tab.key}
          className={cn(viewTabsContent({ variant }), contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ViewTabs;
