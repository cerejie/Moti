import ContentView from "../../components/common/view/ContentView";
import AccountCard from "../../components/settings/cards/AccountCard";
import InstallAppCard from "../../components/settings/cards/InstallAppCard";
import SettingsLinksCard from "../../components/settings/cards/SettingsLinksCard";
import ShopSettingsCard from "../../components/settings/cards/ShopSettingsCard";
import { settingsStack } from "../../styles/settings/settings.styles";

const SettingsView = () => (
  <ContentView title="Settings" subtitle="Your account, shop defaults, lists and people">
    <div className={settingsStack}>
      <AccountCard />
      <SettingsLinksCard />
      <ShopSettingsCard />
      <InstallAppCard />
    </div>
  </ContentView>
);

export default SettingsView;
