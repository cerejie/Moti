import { CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { syncIndicatorIcon } from "../../../styles/status/badge.styles";
import StatusBadge from "./StatusBadge";

// Silent while online and fully synced; otherwise says why writes are waiting.
const SyncIndicator = () => {
  const { online, pending, flushing, lastError } = useSyncStatus();

  if (!online) {
    return (
      <StatusBadge tone="warning" title="Changes are saved on this device and sync later">
        <CloudOff className={syncIndicatorIcon} aria-hidden />
        Offline{pending > 0 ? ` · ${pending}` : ""}
      </StatusBadge>
    );
  }

  if (pending === 0) return null;

  if (lastError && !flushing) {
    return (
      <StatusBadge tone="danger" title={lastError}>
        <TriangleAlert className={syncIndicatorIcon} aria-hidden />
        {pending} not synced
      </StatusBadge>
    );
  }

  return (
    <StatusBadge tone="info">
      <RefreshCw className={syncIndicatorIcon} aria-hidden />
      Syncing {pending}
    </StatusBadge>
  );
};

export default SyncIndicator;
