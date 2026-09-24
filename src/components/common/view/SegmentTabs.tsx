import type { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/utils/cn.utils";
import {
  segmentTabsContent,
  segmentTabsList,
  segmentTabsListFill,
  segmentTabsTrigger,
  segmentTabsTriggerFill,
} from "../../../styles/view/segmentTabs.styles";
import { viewTabsBar } from "../../../styles/view/tabs.styles";

export type ISegmentTab = {
  key: string;
  label: ReactNode;
  // Drawn ahead of the label.
  icon?: ReactNode;
  // Omitted when the choice is answered elsewhere on the screen rather than
  // in a panel under the tabs.
  content?: ReactNode;
};

type IProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: ISegmentTab[];
  label: string;
  className?: string;
  // Sits on the same row as the tab list, e.g. a panel's primary action.
  actions?: ReactNode;
  // The list spans its container and the tabs share it equally.
  fill?: boolean;
  size?: "md" | "lg";
};

const SegmentTabs = ({
  value,
  onValueChange,
  tabs,
  label,
  className,
  actions,
  fill = false,
  size = "md",
}: IProps) => {

  const hasContent = tabs.some((tab) => tab.content !== undefined);

  const list = (
    <TabsList
      aria-label={label}
      className={cn(segmentTabsList({ size }), fill && segmentTabsListFill)}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.key}
          id={tab.key}
          className={cn(
            segmentTabsTrigger({ size }),
            fill && segmentTabsTriggerFill,
          )}
        >
          {tab.icon}
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

      {hasContent &&
        tabs.map((tab) => (
          <TabsContent
            key={tab.key}
            id={tab.key}
            className={segmentTabsContent}
          >
            {tab.content}
          </TabsContent>
        ))}
    </Tabs>
  );
};

export default SegmentTabs;
