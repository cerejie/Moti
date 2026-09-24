import { Bike } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNavigationGroups } from "../../../hook/layout/navigation.hook";
import {
  sidebarBrandButton,
  sidebarBrandLogo,
  sidebarBrandName,
  sidebarBrandText,
  sidebarContent,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarMenu,
  sidebarMenuButton,
} from "../../../styles/layout/sidebar.styles";

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
                  {group.items.map(({ route, active }) => (
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
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
