import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import { useScrollTracker } from "../../../hook/common/scroll.hook";
import { usePushedRoute } from "../../../hook/layout/navigation.hook";
import {
  appShellContentInner,
  phoneColumnEnter,
  phoneContent,
  phoneShell,
} from "../../../styles/layout/appShell.styles";
import AppBar from "./AppBar";
import TabBar from "./TabBar";

type IProps = {
  actions?: ReactNode;
  children?: ReactNode;
};

// TARTAR's PhoneShell: app bar, one scroll box, then the floating tab bar as the
// last row of the column, so nothing has to reserve room beneath the content.
// A pushed screen drops both bars and carries its own back button.
const PhoneShell = ({ actions, children }: IProps) => {
  const { pathname, handleScroll } = useScrollTracker();
  const { pushed } = usePushedRoute();

  return (
    <div className={phoneShell({ pushed })}>
      {!pushed && <AppBar actions={actions} />}

      <main id="main-content" onScroll={handleScroll} className={phoneContent}>
        <div key={pathname} className={cn(appShellContentInner, phoneColumnEnter)}>
          {children}
        </div>
      </main>

      {!pushed && <TabBar />}
    </div>
  );
};

export default PhoneShell;
