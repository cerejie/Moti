import type { ReactNode } from "react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import type { ModalSize } from "../../../models/common/view.model";
import {
  drawerBody,
  drawerCloseBar,
  drawerContent,
  drawerFooter,
  drawerHeaderRuled,
  modalBody,
  modalCloseBar,
  modalContent,
  modalFooter,
  modalHeaderHidden,
  modalHeaderRuled,
  modalSize,
} from "../../../styles/modal/modal.styles";

type IProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
  className?: string;
  // Lets a modal that brings its own padding (tabs, a print sheet) zero the body's.
  bodyClassName?: string;
  // A blocking modal cannot be escaped, clicked away or closed,
  // and stays a dialog on phones so it can't be dismissed there either.
  dismissible?: boolean;
  // Keeps the title for screen readers while the modal draws its own heading.
  // The ruled header row stays, holding only the ✕, unless the modal is blocking.
  hideHeader?: boolean;
  children?: ReactNode;
};

const AppModal = ({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  footer,
  className,
  bodyClassName,
  dismissible = true,
  hideHeader = false,
  children,
}: IProps) => {
  const isMobile = useIsMobile();
  const hasCloseBar = hideHeader && dismissible;

  // Phones get a bottom sheet. The aria drawer is built on Base UI, so the
  // aria sheet from the bottom stands in for it.
  if (isMobile && dismissible) {
    return (
      <Sheet
        side="bottom"
        isOpen={open}
        onOpenChange={onOpenChange}
        className={cn(drawerContent, className)}
      >
        <SheetHeader
          className={cn(
            !hideHeader && drawerHeaderRuled,
            hideHeader && !hasCloseBar && modalHeaderHidden,
            hasCloseBar && drawerCloseBar,
          )}
        >
          <SheetTitle className={cn(hasCloseBar && modalHeaderHidden)}>
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className={cn(hasCloseBar && modalHeaderHidden)}>
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className={cn(drawerBody, bodyClassName)}>{children}</div>

        {footer && <SheetFooter className={drawerFooter}>{footer}</SheetFooter>}
      </Sheet>
    );
  }

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable={dismissible}
      isKeyboardDismissDisabled={!dismissible}
      showCloseButton={dismissible}
      className={cn(modalContent, modalSize({ size }), className)}
    >
      <DialogHeader
        className={cn(
          !hideHeader && modalHeaderRuled,
          hideHeader && !hasCloseBar && modalHeaderHidden,
          hasCloseBar && modalCloseBar,
        )}
      >
        <DialogTitle className={cn(hasCloseBar && modalHeaderHidden)}>
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className={cn(hasCloseBar && modalHeaderHidden)}>
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className={cn(modalBody, bodyClassName)}>{children}</div>

      {footer && <DialogFooter className={modalFooter}>{footer}</DialogFooter>}
    </Dialog>
  );
};

export default AppModal;
