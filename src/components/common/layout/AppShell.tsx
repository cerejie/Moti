import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  appShellBody,
  appShellContent,
  appShellContentInner,
  appShellInset,
  appShellRoot,
} from "../../../styles/layout/appShell.styles";
import AppSidebar from "./AppSidebar";
import TabBar from "./TabBar";
import Topbar from "./Topbar";

type IProps = {
  // Account-level controls for the topbar, supplied by the layout.
  actions?: ReactNode;
  children?: ReactNode;
};

const AppShell = ({ actions, children }: IProps) => (
  <SidebarProvider className={appShellRoot}>
    <Topbar actions={actions} />

    <div className={appShellBody}>
      <AppSidebar />

      <SidebarInset className={appShellInset}>
        <div id="main-content" className={appShellContent}>
          <div className={appShellContentInner}>{children}</div>
        </div>
      </SidebarInset>
    </div>

    <TabBar />
  </SidebarProvider>
);

export default AppShell;
