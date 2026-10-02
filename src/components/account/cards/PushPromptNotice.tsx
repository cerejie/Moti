import { BellRing } from "lucide-react";
import { usePushPrompt } from "../../../hook/common/push.hook";
import AppButton from "../../common/button/AppButton";
import AppAlert from "../../common/status/AppAlert";

// Shown once to an owner whose device is not yet subscribed.
const PushPromptNotice = () => {
  const { visible, enable, enabling, dismiss } = usePushPrompt();

  if (!visible) return null;

  return (
    <AppAlert
      tone="brand"
      icon={<BellRing />}
      title="Get low-stock alerts on this phone"
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
      Moti notifies you the moment an item runs low or sells out.
    </AppAlert>
  );
};

export default PushPromptNotice;
