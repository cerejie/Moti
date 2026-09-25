import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  appShellContent,
  appShellContentInner,
  appShellInset,
  appShellRoot,
} from "../../../styles/layout/appShell.styles";
import InstallBanner from "../status/InstallBanner";
import OfflineBanner from "../status/OfflineBanner";
import AppSidebar from "./AppSidebar";
import TabBar from "./TabBar";
import Topbar from "./Topbar";

type IProps = {
  children?: ReactNode;
};

const AppShell = ({ children }: IProps) => (
  <SidebarProvider className={appShellRoot}>
    <AppSidebar />

    <SidebarInset className={appShellInset}>
      <Topbar />
      <OfflineBanner />
      <div id="main-content" className={appShellContent}>
        <div className={appShellContentInner}>
          <InstallBanner />
          {children}
        </div>
      </div>
    </SidebarInset>

    <TabBar />
  </SidebarProvider>
);

export default AppShell;
