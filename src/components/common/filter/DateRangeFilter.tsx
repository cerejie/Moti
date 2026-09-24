import { CalendarDays } from "lucide-react";
import { parseDate } from "@internationalized/date";
import { Dialog } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { RangeCalendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.utils";
import type { IDateRange } from "../../../models/data/analyzer/analyzer.request";
import {
  dateRangeDialog,
  dateRangePopover,
  dateRangeText,
  dateRangeTrigger,
} from "../../../styles/filter/dateRangeFilter.styles";
import { formatDateRange } from "../../../utils/format.utils";

type IProps = {
  // Accessible name for the button and the calendar.
  label: string;
  value: IDateRange | null;
  onChange: (range: IDateRange) => void;
  // Shown when no range is set.
  placeholder?: string;
  // The last pickable day, e.g. today in the shop's timezone.
  maxDate?: string;
  className?: string;
};

// Picks a from–to pair of calendar dates; closes once both ends are chosen.
const DateRangeFilter = ({
  label,
  value,
  onChange,
  placeholder = "Any date",
  maxDate,
  className,
}: IProps) => {
  return (
    <PopoverTrigger>
      <Button variant="outline" aria-label={label} className={cn(dateRangeTrigger, className)}>
        <CalendarDays data-icon="inline-start" />
        <span className={dateRangeText}>
          {value ? formatDateRange(value.from, value.to) : placeholder}
        </span>
      </Button>
      <Popover placement="bottom start" className={dateRangePopover}>
        <Dialog aria-label={label} className={dateRangeDialog}>
          {({ close }) => (
            <RangeCalendar
              aria-label={label}
              value={value ? { start: parseDate(value.from), end: parseDate(value.to) } : null}
              maxValue={maxDate ? parseDate(maxDate) : undefined}
              onChange={(range) => {
                if (!range) return;
                onChange({ from: range.start.toString(), to: range.end.toString() });
                close();
              }}
            />
          )}
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default DateRangeFilter;
