import { Share } from "lucide-react";
import { iosShareIcon } from "../../../styles/status/pwa.styles";

const IosInstallSteps = () => (
  <>
    Tap <Share aria-hidden className={iosShareIcon} /> Share, then{" "}
    <strong>Add to Home Screen</strong>.
  </>
);

export default IosInstallSteps;
