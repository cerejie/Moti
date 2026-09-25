import { Download } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import AppAlert from "../../common/status/AppAlert";
import IosInstallSteps from "../../common/status/IosInstallSteps";
import { useInstallApp } from "../../../hook/common/pwa.hook";
import { settingsActions, settingsSubmit } from "../../../styles/settings/settings.styles";
import { installNote } from "../../../styles/status/pwa.styles";

const InstallBody = () => {
  const { installed, canInstall, showIosHint, install } = useInstallApp();

  if (installed) {
    return (
      <AppAlert status tone="success">
        Moti is installed on this device.
      </AppAlert>
    );
  }

  if (canInstall) {
    return (
      <div className={settingsActions}>
        <AppButton onPress={install} className={settingsSubmit}>
          <Download />
          Install Moti
        </AppButton>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <p className={installNote}>
        <IosInstallSteps />
      </p>
    );
  }

  // Chromium stops offering the prompt once installed, so this also covers an already-installed app.
  return (
    <p className={installNote}>
      Install isn't available in this browser right now. If Moti is already installed, open it
      from your home screen or app list.
    </p>
  );
};

const InstallAppCard = () => (
  <SectionCard
    title="Install app"
    description="Open Moti from your home screen and keep working offline."
  >
    <InstallBody />
  </SectionCard>
);

export default InstallAppCard;
