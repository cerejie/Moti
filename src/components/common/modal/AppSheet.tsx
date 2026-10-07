import type { ReactNode } from "react";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useCloseOnNavigate, useSheetEntry } from "../../../hook/common/sheet.hook";
import { useSwipeToClose } from "../../../hook/common/swipe.hook";
import type { SheetKind } from "../../../models/common/view.model";
import {
  drawerContent,
  drawerFooter,
  drawerHeaderRuled,
  drawerKind,
} from "../../../styles/modal/modal.styles";
import {
  appSheetBody,
  appSheetBottom,
  appSheetContent,
  appSheetDragHeader,
  appSheetGrabHandle,
  appSheetGrabZone,
  appSheetSide,
} from "../../../styles/modal/sheet.styles";

type IProps = {
  open: boolean;
  title: string;
  description?: string;
  kind?: SheetKind;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

// A light sheet for menus and pickers: swiped down on compact screens, a side
// panel on wide ones. Forms and records still go through AppModal.
const AppSheet = ({
  open,
  title,
  description,
  kind = "action",
  footer,
  onClose,
  children,
}: IProps) => {
  const isCompact = useIsCompact();
  const swipeHandlers = useSwipeToClose(onClose);
  const dragHandlers = isCompact ? swipeHandlers : {};
  useCloseOnNavigate(open, onClose);
  useSheetEntry(open, onClose);

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Sheet
      side={isCompact ? "bottom" : "right"}
      isOpen={open}
      onOpenChange={handleOpenChange}
      className={cn(appSheetContent, isCompact ? cn(drawerContent, drawerKind({ kind }), appSheetBottom) : appSheetSide)}
    >
      {isCompact && (
        <div className={appSheetGrabZone} aria-hidden="true" {...swipeHandlers}>
          <span className={appSheetGrabHandle} />
        </div>
      )}

      <SheetHeader className={cn(drawerHeaderRuled, isCompact && appSheetDragHeader)} {...dragHandlers}>
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>

      <div className={appSheetBody}>{children}</div>

      {footer && <SheetFooter className={drawerFooter}>{footer}</SheetFooter>}
    </Sheet>
  );
};

export default AppSheet;
