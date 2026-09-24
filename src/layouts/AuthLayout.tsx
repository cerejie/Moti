import type { ReactNode } from "react";
import { Bike } from "lucide-react";
import { Outlet } from "react-router-dom";
import {
  authBrand,
  authBrandLogo,
  authBrandName,
  authColumn,
  authScreen,
} from "../styles/auth/auth.styles";

type IProps = {
  // The route guards pass their loading and locked-out states; as a route it
  // renders the matched auth page.
  children?: ReactNode;
};

const AuthLayout = ({ children }: IProps) => (
  <main className={authScreen}>
    <div className={authColumn}>
      <div className={authBrand}>
        <Bike className={authBrandLogo} aria-hidden="true" />
        <span className={authBrandName}>Moti</span>
      </div>

      {children ?? <Outlet />}
    </div>
  </main>
);

export default AuthLayout;
