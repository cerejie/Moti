import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppShell from "../components/common/layout/AppShell";
import SyncIssuesModal from "../components/common/modal/SyncIssuesModal";
import TabBarMoreModal from "../components/common/modal/TabBarMoreModal";
import ErrorBoundary from "../components/common/status/ErrorBoundary";
import PageSkeleton from "../components/common/status/PageSkeleton";
import StockAlertsModal from "../components/dashboard/modal/StockAlertsModal";
import { useNetwork } from "../hook/common/network.hook";
import {
  useActivePage,
  usePreloadPages,
  useScrollReset,
} from "../hook/layout/navigation.hook";

const AppLayout = () => {
  const location = useLocation();
  const page = useActivePage();
  useNetwork();
  useScrollReset();
  usePreloadPages();

  return (
    <AppShell>
      {/* Keyed by route: clears a contained error, and the fresh Suspense shows the new page's skeleton at once rather than holding the old page. */}
      <ErrorBoundary
        key={location.pathname}
        title="This page couldn't be displayed"
        message="Something unexpected happened while loading this page. Try again, or pick another page from the menu."
      >
        <Suspense fallback={<PageSkeleton variant={page?.skeleton} />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <SyncIssuesModal />
      <TabBarMoreModal />
      <StockAlertsModal />
    </AppShell>
  );
};

export default AppLayout;
