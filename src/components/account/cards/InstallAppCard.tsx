import { Download, Share } from "lucide-react";
import { useInstallApp } from "../../../hook/common/install.hook";
import { accountCardBody, accountHint } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import StatusBadge from "../../common/status/StatusBadge";

const InstallAppCard = () => {
  const { installed, canPrompt, showIosHint, install } = useInstallApp();

  return (
    <SectionCard
      title="Install Moti"
      actions={installed && <StatusBadge tone="success">Installed</StatusBadge>}
    >
      <div className={accountCardBody}>
        {installed && (
          <p className={accountHint}>You are using the installed app.</p>
        )}
        {!installed && canPrompt && (
          <>
            <p className={accountHint}>
              Add Moti to this device for a full-screen app that opens from the home screen and
              keeps working offline.
            </p>
            <AppButton onPress={() => void install()}>
              <Download />
              Install app
            </AppButton>
          </>
        )}
        {showIosHint && (
          <p className={accountHint}>
            <Share aria-hidden /> In Safari, tap Share, then “Add to Home Screen”.
          </p>
        )}
        {!installed && !canPrompt && !showIosHint && (
          <p className={accountHint}>
            Use your browser’s menu and choose “Install app” or “Add to Home Screen”.
          </p>
        )}
      </div>
    </SectionCard>
  );
};

export default InstallAppCard;
