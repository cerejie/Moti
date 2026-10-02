import { BellRing } from "lucide-react";
import { usePushPrompt } from "../../../hook/common/push.hook";
import AppButton from "../../common/button/AppButton";
import AppAlert from "../../common/status/AppAlert";

// Shown until dismissed to anyone whose device is not yet subscribed.
const PushPromptNotice = () => {
  const { visible, summary, enable, enabling, dismiss } = usePushPrompt();

  if (!visible) return null;

  return (
    <AppAlert
      tone="brand"
      icon={<BellRing />}
      title="Get notifications on this device"
      status
      actions={
        <>
          <AppButton size="sm" loading={enabling} onPress={enable}>
            Turn on
          </AppButton>
          <AppButton size="sm" variant="ghost" onPress={dismiss}>
            Not now
          </AppButton>
        </>
      }
    >
      {summary}
    </AppAlert>
  );
};

export default PushPromptNotice;
