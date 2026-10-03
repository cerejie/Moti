import { LogOut, Moon, Sun } from "lucide-react";
import { useAccountLogoutHook } from "../../../hook/data/account/account.logout.hook";
import { selectTheme, useThemeStore } from "../../../store/common/theme.store";
import { accountCardBody, accountSignOut } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import SegmentedControl, { type ISegmentedOption } from "../../common/filter/SegmentedControl";

const themeOptions: ISegmentedOption[] = [
  { value: "light", label: "Light", icon: <Sun aria-hidden /> },
  { value: "dark", label: "Dark", icon: <Moon aria-hidden /> },
];

// The phone's Account tab is where people look for these; the avatar menu keeps them for desktop.
const AccountDeviceCard = () => {
  const theme = useThemeStore(selectTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { signOut, signingOut } = useAccountLogoutHook();

  return (
    <SectionCard title="Appearance and sign out">
      <div className={accountCardBody}>
        <SegmentedControl
          size="lg"
          label="Appearance"
          value={theme}
          options={themeOptions}
          onValueChange={(next) => next !== theme && toggleTheme()}
        />
        <AppButton
          variant="destructive"
          loading={signingOut}
          onPress={signOut}
          className={accountSignOut}
        >
          <LogOut />
          Sign out
        </AppButton>
      </div>
    </SectionCard>
  );
};

export default AccountDeviceCard;
