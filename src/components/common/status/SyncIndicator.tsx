import { CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { syncQueueModalKey } from "../../../keys/modal.keys";
import {
  syncIndicatorIcon,
  syncIndicatorTrigger,
} from "../../../styles/status/badge.styles";
import AppButton from "../button/AppButton";
import StatusBadge from "./StatusBadge";
import SyncQueueModal from "./SyncQueueModal";

const SyncBadge = () => {
  const { online, waiting, failed, flushing } = useSyncStatus();
  const pending = waiting + failed;

  if (!online) {
    return (
      <StatusBadge tone="warning" title="Changes are saved on this device and sync later">
        <CloudOff className={syncIndicatorIcon} aria-hidden />
        Offline{pending > 0 ? ` · ${pending}` : ""}
      </StatusBadge>
    );
  }

  if (flushing) {
    return (
      <StatusBadge tone="info">
        <RefreshCw className={syncIndicatorIcon} aria-hidden />
        Syncing {pending}
      </StatusBadge>
    );
  }

  if (failed > 0) {
    return (
      <StatusBadge tone="danger">
        <TriangleAlert className={syncIndicatorIcon} aria-hidden />
        {pending} not synced
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="warning">
      <CloudOff className={syncIndicatorIcon} aria-hidden />
      {waiting} waiting
    </StatusBadge>
  );
};

// Silent while online and fully synced; otherwise says why writes are waiting,
// and opens the list of them when anything is queued.
const SyncIndicator = () => {
  const { online, waiting, failed } = useSyncStatus();
  const { openModal } = useModal(syncQueueModalKey);
  const pending = waiting + failed;

  return (
    <>
      {pending > 0 ? (
        <AppButton
          variant="ghost"
          size="sm"
          className={syncIndicatorTrigger}
          onPress={() => openModal()}
        >
          <SyncBadge />
        </AppButton>
      ) : (
        !online && <SyncBadge />
      )}
      <SyncQueueModal />
    </>
  );
};

export default SyncIndicator;
