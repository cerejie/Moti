import { useModal } from "../../../hook/common/modal.hook";
import { usePendingSales } from "../../../hook/common/network.hook";
import { syncQueueModalKey } from "../../../keys/modal.keys";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import AppAlert from "../../common/status/AppAlert";

// Sales saved on this device are not in the history until they sync; say so where people look.
const PendingSalesNotice = () => {
  const { waiting, failed } = usePendingSales();
  const { openModal } = useModal(syncQueueModalKey);

  if (waiting + failed === 0) return null;

  return (
    <AppAlert
      tone={failed > 0 ? "danger" : "warning"}
      title={
        failed > 0
          ? `${formatCount(failed, "sale")} could not be saved`
          : `${formatCount(waiting, "sale")} saved on this device, waiting to sync`
      }
      actions={
        <AppButton variant="outline" onPress={() => openModal()}>
          {failed > 0 ? "Review and retry" : "View"}
        </AppButton>
      }
    >
      {failed > 0
        ? "Stock was not taken for these yet. Open them to retry or discard."
        : "They are not in the history or the owner's stock until this device is back online."}
    </AppAlert>
  );
};

export default PendingSalesNotice;
