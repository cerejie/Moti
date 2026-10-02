import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigationGroups } from "../../../hook/layout/navigation.hook";
import {
  sidebarContent,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarMenu,
  sidebarMenuButton,
  sidebarRoot,
} from "../../../styles/layout/sidebar.styles";

// A fixed desktop panel, as in TARTAR: collapsible="none" renders it inline in
// the shell's flex row instead of as an off-canvas drawer.
const AppSidebar = () => {
  const groups = useNavigationGroups();

  return (
    <Sidebar collapsible="none" className={sidebarRoot}>
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
    </Sidebar>
  );
};

export default AppSidebar;
