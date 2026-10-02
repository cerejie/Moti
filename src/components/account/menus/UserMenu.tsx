import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useAccountLogoutHook } from "../../../hook/account/account.logout.hook";
import type { IRowAction } from "../../../models/common/action.model";
import { ROUTES } from "../../../routes/route.paths";
import { selectTheme, useThemeStore } from "../../../store/common/theme.store";
import {
  selectDisplayName,
  selectEmail,
  selectRole,
  useAccountStore,
} from "../../../store/data/account/account.store";
import AccountMenu from "../../common/layout/AccountMenu";

const UserMenu = () => {
  const navigate = useNavigate();
  const name = useAccountStore(selectDisplayName);
  const email = useAccountStore(selectEmail);
  const role = useAccountStore(selectRole);
  const theme = useThemeStore(selectTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { signOut, signingOut } = useAccountLogoutHook();
  const isDark = theme === "dark";

  const actions: IRowAction[] = [
    {
      key: "account",
      label: "My account",
      icon: <UserRound />,
      onSelect: () => navigate(ROUTES.account),
    },
    {
      key: "theme",
      label: isDark ? "Light mode" : "Dark mode",
      icon: isDark ? <Sun /> : <Moon />,
      onSelect: toggleTheme,
    },
    {
      key: "sign-out",
      label: "Sign out",
      icon: <LogOut />,
      danger: true,
      disabled: signingOut,
      onSelect: signOut,
    },
  ];

  return (
    <AccountMenu
      name={name}
      subtitle={role ? effectiveRoleLabels[role] : ""}
      email={email}
      actions={actions}
    />
  );
};

export default UserMenu;
