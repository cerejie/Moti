import { Outlet, useLocation } from "react-router-dom";
import UserMenu from "../components/account/menus/UserMenu";
import AppShell from "../components/common/layout/AppShell";
import ErrorBoundary from "../components/common/status/ErrorBoundary";
import InboxBell from "../components/inbox/menus/InboxBell";
import { useNetwork } from "../hook/common/network.hook";
import { usePushStatusListener } from "../hook/common/push.hook";
import { useInboxRealtime } from "../hook/data/inbox/inbox.list.hook";
import { useScrollReset } from "../hook/layout/navigation.hook";

const AppLayout = () => {
  const location = useLocation();
  useNetwork();
  usePushStatusListener();
  useInboxRealtime();
  useScrollReset();

  return (
    <AppShell
      actions={
        <>
          <InboxBell />
          <UserMenu />
        </>
      }
    >
      {/* Keyed by route so navigating away clears a contained error. */}
      <ErrorBoundary
        key={location.pathname}
        title="This page couldn't be displayed"
        message="Something unexpected happened while loading this page. Try again, or pick another page from the menu."
      >
        <Outlet />
      </ErrorBoundary>
    </AppShell>
  );
};

export default AppLayout;
