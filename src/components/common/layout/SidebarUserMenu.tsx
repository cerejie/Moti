import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { userRoleLabels } from "../../../enums/role.enum";
import {
  useMe,
  useSignOut,
} from "../../../hook/data/auth/auth.session.hook";
import {
  selectEmail,
  useAuthStore,
} from "../../../store/data/auth/auth.store";
import {
  userMenuButton,
  userMenuChevron,
  userMenuMeta,
  userMenuName,
  userMenuText,
} from "../../../styles/layout/userMenu.styles";
import AppAvatar from "../view/AppAvatar";

const SidebarUserMenu = () => {
  const { data: me } = useMe();
  const email = useAuthStore(selectEmail);
  const signOut = useSignOut();

  const name = me?.full_name ?? email ?? "Account";
  const meta = me
    ? [userRoleLabels[me.role], me.shop?.name].filter(Boolean).join(" · ")
    : email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton size="lg" tooltip={name} className={userMenuButton}>
            <AppAvatar alt={name} fallback={<UserRound />} />
            <span className={userMenuText}>
              <span className={userMenuName}>{name}</span>
              {meta && <span className={userMenuMeta}>{meta}</span>}
            </span>
            <ChevronsUpDown className={userMenuChevron} aria-hidden="true" />
          </SidebarMenuButton>

          <DropdownMenu placement="top start" aria-label="Account">
            <DropdownMenuGroup>
              <DropdownMenuItem
                id="sign-out"
                textValue="Sign out"
                isDisabled={signOut.isPending}
                onAction={() => signOut.mutate()}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarUserMenu;
