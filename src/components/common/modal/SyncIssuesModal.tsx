import { CloudCheck, RefreshCw, Trash2 } from "lucide-react";
import { useSyncIssues } from "../../../hook/common/network.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { syncIssuesModalKey } from "../../../keys/modal.keys";
import { formatDateTime } from "../../../utils/format.utils";
import {
  syncError,
  syncIntro,
  syncLabel,
  syncList,
  syncMeta,
  syncRow,
  syncRowText,
} from "../../../styles/status/sync.styles";
import AppButton from "../button/AppButton";
import AppAlert from "../status/AppAlert";
import StateBox from "../status/StateBox";
import StatusBadge from "../status/StatusBadge";
import AppModal from "./AppModal";

// Writes wait in order; one the server refuses holds the rest until it is retried or discarded.
const SyncIssuesModal = () => {
  const { modal, openModal, closeModal } = useModal(syncIssuesModalKey);
  const { writes, online, flushing, failedId, lastError, retry, discard } = useSyncIssues();

  const intro = () => {
    if (!online) {
      return (
        <AppAlert tone="info" title="You're offline" status className={syncIntro}>
          These changes are saved on this device and send when you're back online.
        </AppAlert>
      );
    }
    if (failedId) {
      return (
        <AppAlert tone="danger" title="A change couldn't sync" className={syncIntro}>
          The server refused it, so the changes after it are waiting too. Fix the cause and
          retry, or discard it.
        </AppAlert>
      );
    }
    return null;
  };

  const renderBody = () => {
    if (writes.length === 0) {
      return (
        <StateBox icon={<CloudCheck />} title="All changes synced">
          Nothing is waiting to be sent.
        </StateBox>
      );
    }

    return (
      <>
        {intro()}
        <ul className={syncList}>
          {writes.map((write) => (
            <li key={write.id} className={syncRow}>
              <div className={syncRowText}>
                <span className={syncLabel}>{write.label}</span>
                <span className={syncMeta}>
                  {write.queuedAt ? `Saved ${formatDateTime(write.queuedAt)}` : "Saved offline"}
                </span>
                {write.id === failedId && (
                  <>
                    <StatusBadge tone="danger">Refused</StatusBadge>
                    {lastError && <span className={syncError}>{lastError}</span>}
                  </>
                )}
              </div>
              <AppButton
                variant="ghost"
                size="icon-lg"
                aria-label={`Discard ${write.label}`}
                disabled={flushing}
                onPress={() => discard(write)}
              >
                <Trash2 />
              </AppButton>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => (open ? openModal() : closeModal())}
      title="Waiting to sync"
      description="Changes made on this device that haven't reached the server yet."
      size="md"
      footer={
        <>
          <AppButton variant="secondary" onPress={closeModal}>
            Close
          </AppButton>
          <AppButton
            loading={flushing}
            disabled={!online || writes.length === 0}
            onPress={retry}
          >
            <RefreshCw />
            Retry now
          </AppButton>
        </>
      }
    >
      {renderBody()}
    </AppModal>
  );
};

export default SyncIssuesModal;
