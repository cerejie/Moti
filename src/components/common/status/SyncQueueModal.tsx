import { CloudCheck } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useSyncQueue } from "../../../hook/common/network.hook";
import { syncQueueModalKey } from "../../../keys/modal.keys";
import type { IQueueEntry } from "../../../models/common/write.model";
import {
  syncQueueList,
  syncQueueRow,
  syncQueueRowStatus,
  syncQueueRowText,
  syncQueueRowTitle,
} from "../../../styles/status/sync.styles";
import { formatDateTime } from "../../../utils/format.utils";
import AppButton from "../button/AppButton";
import AppModal from "../modal/AppModal";
import EmptyState from "./EmptyState";

const statusText = (entry: IQueueEntry) => {
  const status = entry.failure ?? "Waiting to send";
  return entry.queuedAt ? `${formatDateTime(entry.queuedAt)} · ${status}` : status;
};

// Writes still on this device: why each one is waiting, with Retry and Discard.
const SyncQueueModal = () => {
  const { modal, closeModal } = useModal(syncQueueModalKey);
  const { queue, flushing, canRetry, retry, discard } = useSyncQueue();

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => !open && closeModal()}
      title="Not synced yet"
      description="These changes are saved on this device only."
      size="md"
      footer={
        <>
          <AppButton variant="outline" onPress={closeModal}>
            Close
          </AppButton>
          <AppButton loading={flushing} disabled={!canRetry} onPress={retry}>
            Retry
          </AppButton>
        </>
      }
    >
      {queue.length === 0 ? (
        <EmptyState icon={<CloudCheck />} title="Everything is synced" />
      ) : (
        <ul className={syncQueueList}>
          {queue.map((entry) => (
            <li key={entry.id} className={syncQueueRow}>
              <div className={syncQueueRowText}>
                <span className={syncQueueRowTitle}>{entry.label}</span>
                <span className={syncQueueRowStatus({ failed: Boolean(entry.failure) })}>
                  {statusText(entry)}
                </span>
              </div>
              <AppButton
                variant="outline"
                size="sm"
                tone="dangerSoft"
                disabled={flushing}
                onPress={() => discard(entry)}
              >
                Discard
              </AppButton>
            </li>
          ))}
        </ul>
      )}
    </AppModal>
  );
};

export default SyncQueueModal;
