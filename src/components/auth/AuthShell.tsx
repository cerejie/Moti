import type { ReactNode } from "react";
import { BellRing, Boxes, CloudOff } from "lucide-react";
import {
  authBrand,
  authCard,
  authHero,
  authHeroBody,
  authHeroCopy,
  authHeroFill,
  authHeroIcon,
  authHeroItem,
  authHeroList,
  authHeroTitle,
  authHeroWave,
  authHeroWordmark,
  authMain,
  authPage,
  authPanel,
  authSubtitle,
  authTitle,
} from "../../styles/layout/auth.styles";
import BrandMark from "../common/view/BrandMark";
import AuthGlassStack from "./AuthGlassStack";

const features = [
  { icon: <Boxes />, text: "Every part, its stock and its shelf" },
  { icon: <BellRing />, text: "Low-stock alerts straight to the owner's phone" },
  { icon: <CloudOff />, text: "Keeps selling offline, syncs when you return" },
] as const;

type IProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthShell = ({ title, subtitle, children }: IProps) => (
  <div className={authPage}>
    <div className={authCard}>
      <aside className={authHero}>
        <span className={authHeroWave} aria-hidden="true" />
        <span className={authHeroFill} aria-hidden="true" />

        <span className={authHeroWordmark}>Moti</span>

        <div className={authHeroBody}>
          <h1 className={authHeroTitle}>Stock you can count on, at full speed.</h1>
          <p className={authHeroCopy}>
            Inventory for the parts counter: what is on the shelf, what just sold, and what
            needs reordering before a customer asks.
          </p>
          <ul className={authHeroList}>
            {features.map((feature) => (
              <li key={feature.text} className={authHeroItem}>
                <span className={authHeroIcon} aria-hidden="true">
                  {feature.icon}
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>

        <AuthGlassStack />
      </aside>

      <main className={authMain}>
        <div className={authPanel}>
          <BrandMark size="lg" className={authBrand} />
          <h2 className={authTitle}>{title}</h2>
          <p className={authSubtitle}>{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default AuthShell;
