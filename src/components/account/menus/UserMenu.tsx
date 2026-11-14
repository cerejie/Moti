import { LogOut, Moon, Store, Sun, UserRound, Users } from "lucide-react";
import { effectiveRoleLabels } from "../../../enums/role.enum";
import { useAccountLogoutHook } from "../../../hook/data/account/account.logout.hook";
import { usePermissions } from "../../../hook/data/account/account.permission.hook";
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
import { useTransitionNavigate } from "../../../hook/layout/navigation.hook";

const UserMenu = () => {
  const navigate = useTransitionNavigate();
  const name = useAccountStore(selectDisplayName);
  const email = useAccountStore(selectEmail);
  const role = useAccountStore(selectRole);
  const theme = useThemeStore(selectTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { signOut, signingOut } = useAccountLogoutHook();
  const { manageUsers, manageBranches } = usePermissions();
  const isDark = theme === "dark";

  // Occasional administration lives here, off the primary navigation.
  const actions: IRowAction[] = [
    {
      key: "account",
      label: "Account",
      icon: <UserRound />,
      onSelect: () => navigate(ROUTES.account),
    },
    ...(manageUsers
      ? [{ key: "team", label: "Team", icon: <Users />, onSelect: () => navigate(ROUTES.users) }]
      : []),
    ...(manageBranches
      ? [
          {
            key: "branches",
            label: "Branches",
            icon: <Store />,
            onSelect: () => navigate(ROUTES.branches),
          },
        ]
      : []),
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
