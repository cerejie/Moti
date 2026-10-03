import { useDismissSplash } from "../../../hook/common/splash.hook";
import {
  routeErrorPage,
  routeErrorPanel,
} from "../../../styles/layout/appShell.styles";
import ErrorState from "./ErrorState";

const reload = () => window.location.reload();

// Shown in place of the whole route tree when a screen's chunk or loader fails, so
// React Router's developer error screen never reaches a shop user.
const RouteErrorState = () => {
  // It can be the first thing to render, so the launch splash is its to remove.
  useDismissSplash();

  return (
    <main className={routeErrorPage}>
      <ErrorState
        title="This page couldn't be loaded"
        message="Something went wrong while opening this screen. Reload to try again."
        onRetry={reload}
        retryLabel="Reload"
        className={routeErrorPanel}
      />
    </main>
  );
};

export default RouteErrorState;
