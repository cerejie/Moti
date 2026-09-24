import { AlertTriangle, X } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { useConfirmation } from "../../../hook/common/confirmation.hook";
import {
  confirmBody,
  confirmClose,
  confirmCloseLabel,
  confirmDescription,
  confirmFooter,
  confirmItem,
  confirmLead,
  confirmLeadText,
  confirmMedia,
  confirmPhraseGroup,
  confirmTitle,
} from "../../../styles/modal/confirmation.styles";
import { modalCloseBar } from "../../../styles/modal/modal.styles";
import AppAlert from "../status/AppAlert";

const phraseInputId = "confirm-phrase";

// One instance is mounted in App.tsx. Everything else asks for a confirmation
// through useConfirm() rather than rendering its own dialog.
const ConfirmationModal = () => {
  const { confirm, running, phrase, setPhrase, closeConfirm, runConfirm } =
    useConfirmation();

  const kind = confirm.kind ?? "confirm";
  const isDelete = kind === "delete";

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

  return (
    <AlertDialog isOpen={confirm.visible} onOpenChange={handleOpenChange}>
      {/* The same ruled ✕ row AppModal draws when the body brings its own heading. */}
      <div className={modalCloseBar}>
        <Button
          slot="close"
          variant="ghost"
          size="icon-sm"
          className={confirmClose}
          isDisabled={running}
        >
          <X />
          <span className={confirmCloseLabel}>Close</span>
        </Button>
      </div>

      <div className={confirmLead}>
        <AlertDialogHeader className={confirmLeadText}>
          {isDelete && (
            <AlertDialogMedia className={confirmMedia} aria-hidden>
              <AlertTriangle />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle className={confirmTitle}>
            {confirm.title ?? (isDelete ? "Delete" : "Please confirm")}
          </AlertDialogTitle>
          <AlertDialogDescription className={confirmDescription}>
            {confirm.message ??
              "This action cannot be undone. Do you want to continue?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </div>

      <div className={confirmBody}>
        {confirm.itemName && (
          <Item variant="muted" size="sm">
            <ItemContent>
              <ItemTitle className={confirmItem}>{confirm.itemName}</ItemTitle>
            </ItemContent>
          </Item>
        )}

        {isDelete && (
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

      <AlertDialogFooter className={confirmFooter}>
        <AlertDialogCancel isDisabled={running}>
          {confirm.cancelText ?? "Cancel"}
        </AlertDialogCancel>
        {/* Not AlertDialogAction: its close slot would dismiss the dialog
            before the action settles. runConfirm closes it afterwards. */}
        <Button
          variant={isDelete ? "destructive" : "default"}
          isDisabled={running || !phraseMatches}
          onPress={() => void runConfirm()}
        >
          {running && <Spinner />}
          {confirm.okText ?? (isDelete ? "Delete" : "Confirm")}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  );
};

export default ConfirmationModal;
