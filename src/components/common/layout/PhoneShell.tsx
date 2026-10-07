import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import { useScrollTracker } from "../../../hook/common/scroll.hook";
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
const PhoneShell = ({ actions, children }: IProps) => {
  const { pathname, handleScroll } = useScrollTracker();

  return (
    <div className={phoneShell}>
      <AppBar actions={actions} />

      <main id="main-content" onScroll={handleScroll} className={phoneContent}>
        <div key={pathname} className={cn(appShellContentInner, phoneColumnEnter)}>
          {children}
        </div>
      </main>

      <TabBar />
    </div>
  );
};

export default PhoneShell;
