import { Download } from "lucide-react";
import { useInstallApp } from "../../../hook/common/pwa.hook";
import { installBanner } from "../../../styles/status/pwa.styles";
import AppButton from "../button/AppButton";
import AppAlert from "./AppAlert";
import IosInstallSteps from "./IosInstallSteps";

// Offered until installed or dismissed; Settings keeps the same action afterwards.
const InstallBanner = () => {
  const { canInstall, showBanner, install, dismiss } = useInstallApp();

  if (!showBanner) return null;

  return (
    <AppAlert
      status
      tone="brand"
      icon={<Download />}
      title={canInstall ? "Install Moti on this device" : "Add Moti to your Home Screen"}
      className={installBanner}
      actions={
        <>
          {canInstall && (
            <AppButton size="lg" onPress={install}>
              Install
            </AppButton>
          )}
          <AppButton size="lg" variant="ghost" onPress={dismiss}>
            Not now
          </AppButton>
        </>
      }
    >
      {canInstall ? (
        "It opens from your home screen like any app and keeps working offline."
      ) : (
        <IosInstallSteps />
      )}
    </AppAlert>
  );
};

export default InstallBanner;
