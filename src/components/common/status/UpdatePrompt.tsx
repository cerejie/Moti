import { RefreshCw } from "lucide-react";
import { useAppUpdate } from "../../../hook/common/pwa.hook";
import { updatePrompt } from "../../../styles/status/pwa.styles";
import AppButton from "../button/AppButton";
import AppAlert from "./AppAlert";

// Mounted once by App so it also reaches the sign-in screen.
const UpdatePrompt = () => {
  const { needRefresh, blocked, reload, later } = useAppUpdate();

  if (!needRefresh) return null;

  return (
    <AppAlert
      status
      icon={<RefreshCw />}
      title="A new version of Moti is ready"
      className={updatePrompt}
      actions={
        <>
          <AppButton size="lg" loading={blocked} onPress={reload}>
            Reload
          </AppButton>
          <AppButton size="lg" variant="ghost" onPress={later}>
            Later
          </AppButton>
        </>
      }
    >
      {blocked
        ? "Finishing your sync first."
        : "Reload to update. Finish anything you're typing first."}
    </AppAlert>
  );
};

export default UpdatePrompt;
