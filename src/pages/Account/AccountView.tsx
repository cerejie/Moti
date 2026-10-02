import AccountProfileCard from "../../components/account/cards/AccountProfileCard";
import InstallAppCard from "../../components/account/cards/InstallAppCard";
import NotificationsCard from "../../components/account/cards/NotificationsCard";
import TeamLinkCard from "../../components/account/cards/TeamLinkCard";
import ChangePasswordCard from "../../components/account/forms/ChangePasswordCard";
import BentoCell from "../../components/common/view/BentoCell";
import BentoGrid from "../../components/common/view/BentoGrid";
import ContentView from "../../components/common/view/ContentView";

const AccountView = () => (
  <ContentView title="My account" subtitle="Profile, password and this device" layout="bento">
    <BentoGrid>
      <BentoCell span="half">
        <AccountProfileCard />
      </BentoCell>
      <TeamLinkCard />
      <BentoCell span="half">
        <ChangePasswordCard />
      </BentoCell>
      <BentoCell span="half">
        <NotificationsCard />
      </BentoCell>
      <BentoCell span="half">
        <InstallAppCard />
      </BentoCell>
    </BentoGrid>
  </ContentView>
);

export default AccountView;
