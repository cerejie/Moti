import ContentView from "../../components/common/view/ContentView";
import AccountCard from "../../components/settings/cards/AccountCard";
import ShopSettingsCard from "../../components/settings/cards/ShopSettingsCard";
import { settingsStack } from "../../styles/settings/settings.styles";

const SettingsView = () => (
  <ContentView title="Settings" subtitle="Your account and shop defaults">
    <div className={settingsStack}>
      <AccountCard />
      <ShopSettingsCard />
    </div>
  </ContentView>
);

export default SettingsView;
