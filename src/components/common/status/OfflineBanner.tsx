import { WifiOff } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { tone } from "../../../styles/common/tone.styles";
import { offlineBanner, offlineBannerLead } from "../../../styles/status/pwa.styles";

// Shown by the shell while offline; screens keep rendering their cached data below it.
const OfflineBanner = () => {
  const { online, pending } = useSyncStatus();

  if (online) return null;

  const detail =
    pending === 0
      ? "Changes save on this device and sync when you reconnect."
      : `${pending} ${pending === 1 ? "change" : "changes"} waiting to sync.`;

  return (
    <div role="status" className={cn(offlineBanner, tone({ tone: "warning" }))}>
      <WifiOff aria-hidden />
      <span>
        <span className={offlineBannerLead}>You're offline.</span> {detail}
      </span>
    </div>
  );
};

export default OfflineBanner;
