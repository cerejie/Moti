import { CircleAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useConfirmation } from "../../../hook/common/confirmation.hook";
import { useSheetEntry } from "../../../hook/common/sheet.hook";
import type { ConfirmKind } from "../../../models/common/modal.model";
import {
  confirmBody,
  confirmContent,
  confirmFooter,
  confirmItem,
  confirmMedia,
  confirmPhraseGroup,
  confirmSheetBody,
  confirmSheetFooter,
  confirmSheetHeader,
  confirmSheetMedia,
} from "../../../styles/modal/confirmation.styles";
import { drawerContent } from "../../../styles/modal/modal.styles";
import AppAlert from "../status/AppAlert";

const phraseInputId = "confirm-phrase";

const defaultTitles: Record<ConfirmKind, string> = {
  confirm: "Please confirm",
  delete: "Delete",
};

const defaultOkTexts: Record<ConfirmKind, string> = {
  confirm: "Confirm",
  delete: "Delete",
};

const defaultMessage = "This action cannot be undone. Do you want to continue?";

// One instance is mounted in App.tsx. Everything else asks for a confirmation
// through useConfirm() rather than rendering its own dialog.
const ConfirmationModal = () => {
  const isCompact = useIsCompact();
  const { confirm, running, phrase, setPhrase, closeConfirm, runConfirm } =
    useConfirmation();

  const kind = confirm.kind ?? "confirm";
  const title = confirm.title ?? defaultTitles[kind];
  const message = confirm.message ?? defaultMessage;
  const icon = kind === "delete" ? <Trash2 /> : <CircleAlert />;

  // When a phrase is required the action stays disabled until it matches
  // exactly. This is what preserves DeleteAccountDialog's type-DELETE gate.
  const phraseRequired = Boolean(confirm.confirmPhrase);
  const phraseMatches =
    !phraseRequired || phrase.trim() === confirm.confirmPhrase;

  const handleOpenChange = (next: boolean) => {
    if (!next && !running) {
      closeConfirm();
    }
  };

  useSheetEntry(confirm.visible, () => handleOpenChange(false));

  const hasBody = Boolean(confirm.itemName) || kind === "delete" || phraseRequired;

  const body = hasBody ? (
    <div className={cn(confirmBody, isCompact && confirmSheetBody)}>
      {confirm.itemName && (
        <Item variant="muted" size="sm">
          <ItemContent>
            <ItemTitle className={confirmItem}>{confirm.itemName}</ItemTitle>
          </ItemContent>
        </Item>
      )}

      {kind === "delete" && (
        <AppAlert tone="danger">
          This cannot be undone. Anything linked to this record stops being
          available to you.
        </AppAlert>
      )}

      {phraseRequired && (
        <div className={confirmPhraseGroup}>
          <Label htmlFor={phraseInputId}>
            Type <strong>{confirm.confirmPhrase}</strong> to confirm
          </Label>
          <Input
            id={phraseInputId}
            value={phrase}
            placeholder={confirm.confirmPhrase}
            autoComplete="off"
            onChange={(event) => setPhrase(event.target.value)}
          />
        </div>
      )}
    </div>
  ) : null;

  // Not AlertDialogAction: its close slot would dismiss the dialog before the
  // action settles. runConfirm closes it afterwards.
  const okButton = (
    <Button
      variant={kind === "delete" ? "destructive" : "default"}
      isDisabled={running || !phraseMatches}
      onPress={() => void runConfirm()}
    >
      {running && <Spinner />}
      {confirm.okText ?? defaultOkTexts[kind]}
    </Button>
  );

  if (isCompact) {
    return (
      <Sheet
        side="bottom"
        isOpen={confirm.visible}
        onOpenChange={handleOpenChange}
        isDismissable={!running}
        showCloseButton={false}
        className={drawerContent}
      >
        <SheetHeader className={confirmSheetHeader}>
          <span className={cn(confirmSheetMedia, confirmMedia({ kind }))} aria-hidden="true">
            {icon}
          </span>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{message}</SheetDescription>
        </SheetHeader>

        {body}

        <SheetFooter className={confirmSheetFooter}>
          {okButton}
          <Button variant="outline" isDisabled={running} onPress={closeConfirm}>
            {confirm.cancelText ?? "Cancel"}
          </Button>
        </SheetFooter>
      </Sheet>
    );
  }

  return (
    <AlertDialog
      isOpen={confirm.visible}
      onOpenChange={handleOpenChange}
      className={confirmContent}
    >
      <AlertDialogHeader>
        <AlertDialogMedia className={confirmMedia({ kind })} aria-hidden>
          {icon}
        </AlertDialogMedia>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>

      {body}

      <AlertDialogFooter className={confirmFooter}>
        <AlertDialogCancel isDisabled={running}>
          {confirm.cancelText ?? "Cancel"}
        </AlertDialogCancel>
        {okButton}
      </AlertDialogFooter>
    </AlertDialog>
  );
};

export default ConfirmationModal;
