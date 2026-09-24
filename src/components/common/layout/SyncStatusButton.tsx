import { CloudAlert, CloudUpload } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { syncIssuesModalKey } from "../../../keys/modal.keys";
import { syncButton, syncCount, syncCountFailed } from "../../../styles/status/sync.styles";
import AppButton from "../button/AppButton";

// Shown only while this user has writes waiting; opens the Sync issues sheet.
const SyncStatusButton = () => {
  const { pending, failed } = useSyncStatus();
  const { openModal } = useModal(syncIssuesModalKey);

  if (pending === 0) return null;

  const label = failed
    ? `A change couldn't sync. ${pending} waiting.`
    : `${pending} ${pending === 1 ? "change" : "changes"} waiting to sync`;

  return (
    <AppButton
      variant="ghost"
      size="icon-lg"
      aria-label={label}
      onPress={() => openModal()}
      className={syncButton}
    >
      {failed ? <CloudAlert /> : <CloudUpload />}
      <span className={cn(syncCount, failed && syncCountFailed)} aria-hidden>
        {pending}
      </span>
    </AppButton>
  );
};

export default SyncStatusButton;
