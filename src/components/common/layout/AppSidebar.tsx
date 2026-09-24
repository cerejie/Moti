import { Bike } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/utils/cn.utils";
import { useNavigationGroups } from "../../../hook/layout/navigation.hook";
import { toneSolid } from "../../../styles/common/tone.styles";
import {
  sidebarBrandButton,
  sidebarBrandLogo,
  sidebarBrandName,
  sidebarBrandText,
  sidebarContent,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarBadgeLabel,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuButton,
} from "../../../styles/layout/sidebar.styles";
import { formatBadgeCount } from "../../../utils/format.utils";
import { userMenuFooter } from "../../../styles/layout/userMenu.styles";
import SidebarUserMenu from "./SidebarUserMenu";

const AppSidebar = () => {
  const groups = useNavigationGroups();

  return (
    // Collapses to an icon rail; the brand and user rows shrink to their squares.
    <Sidebar collapsible="icon">
      <SidebarHeader className={sidebarHeader}>
        <SidebarMenu className={sidebarMenu}>
          <SidebarMenuItem>
            {/* Static brand row: not a link, so no hover or tooltip. */}
            <div className={sidebarBrandButton}>
              <Bike className={sidebarBrandLogo} aria-hidden="true" />
              <div className={sidebarBrandText}>
                <span className={sidebarBrandName}>Moti</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={sidebarContent}>
        <nav aria-label="Main">
          {groups.map((group) => (
            <SidebarGroup key={group.label} className={sidebarGroup}>
              <SidebarGroupLabel className={sidebarGroupLabel}>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className={sidebarMenu}>
                  {group.items.map(({ route, active, badge }) => (
                    <SidebarMenuItem key={route.key}>
                      <SidebarMenuButton
                        href={route.path}
                        isActive={active}
                        tooltip={route.label}
                        aria-current={active ? "page" : undefined}
                        className={sidebarMenuButton}
                      >
                        <route.icon aria-hidden="true" />
                        <span>{route.label}</span>
                        {badge && (
                          <span className={sidebarBadgeLabel}>
                            , {badge.count} need attention
                          </span>
                        )}
                      </SidebarMenuButton>
                      {badge && (
                        <SidebarMenuBadge
                          className={cn(sidebarMenuBadge, toneSolid({ tone: badge.tone }))}
                          aria-hidden
                        >
                          {formatBadgeCount(badge.count)}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className={userMenuFooter}>
        <SidebarUserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
