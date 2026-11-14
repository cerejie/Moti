import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import {
  appShellBody,
  appShellContent,
  appShellContentInner,
  appShellInset,
  appShellRoot,
} from "../../../styles/layout/appShell.styles";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import PhoneShell from "./PhoneShell";

type IProps = {
  // Account-level controls for the header, supplied by the layout.
  actions?: ReactNode;
  // Always in the wide header; on phones only when the role has no Account tab.
  accountMenu?: ReactNode;
  accountMenuOnPhone?: boolean;
  children?: ReactNode;
};

// Compact screens get TARTAR's PhoneShell; wide ones its floating-panel shell.
const AppShell = ({ actions, accountMenu, accountMenuOnPhone = false, children }: IProps) => {
  const isCompact = useIsCompact();

  if (isCompact) {
    return (
      <PhoneShell
        actions={
          <>
            {actions}
            {accountMenuOnPhone && accountMenu}
          </>
        }
      >
        {children}
      </PhoneShell>
    );
  }

  return (
    <SidebarProvider className={appShellRoot}>
      <AppHeader
        actions={
          <>
            {actions}
            {accountMenu}
          </>
        }
      />

      <div className={appShellBody}>
        <AppSidebar />

        <SidebarInset className={appShellInset}>
          <div id="main-content" className={appShellContent}>
            <div className={appShellContentInner}>{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
