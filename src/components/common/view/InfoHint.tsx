import { Info } from "lucide-react";
import { Dialog } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.utils";
import {
  infoHintDialog,
  infoHintItem,
  infoHintList,
  infoHintPopover,
  infoHintTerm,
  infoHintText,
  infoHintTrigger,
} from "../../../styles/view/infoHint.styles";

export type IInfoHintItem = {
  label: string;
  text: string;
};

type IProps = {
  // Accessible name, e.g. "How units sold is counted".
  label: string;
  items: IInfoHintItem[];
  className?: string;
};

// A popover rather than a tooltip, because a tooltip never opens on a tap.
const InfoHint = ({ label, items, className }: IProps) => {
  return (
    <PopoverTrigger>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        className={cn(infoHintTrigger, className)}
      >
        <Info />
      </Button>
      <Popover placement="top" className={infoHintPopover}>
        <Dialog aria-label={label} className={infoHintDialog}>
          <dl className={infoHintList}>
            {items.map((item) => (
              <div key={item.label} className={infoHintItem}>
                <dt className={infoHintTerm}>{item.label}</dt>
                <dd className={infoHintText}>{item.text}</dd>
              </div>
            ))}
          </dl>
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default InfoHint;
