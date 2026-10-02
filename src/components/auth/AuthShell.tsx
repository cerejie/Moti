import type { ReactNode } from "react";
import { BellRing, Boxes, CloudOff } from "lucide-react";
import {
  authCard,
  authCardBrand,
  authHero,
  authHeroAccent,
  authHeroBody,
  authHeroBrand,
  authHeroCopy,
  authHeroIcon,
  authHeroItem,
  authHeroList,
  authHeroTitle,
  authMain,
  authPage,
  authStripe,
  authStripes,
  authSubtitle,
  authTitle,
} from "../../styles/layout/auth.styles";
import BrandMark from "../common/view/BrandMark";

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
    <aside className={authHero}>
      <div className={authHeroBrand}>
        <BrandMark size="lg" tone="hero" />
      </div>

      <div className={authHeroBody}>
        <h1 className={authHeroTitle}>
          Stock you can count on, <span className={authHeroAccent}>at full speed.</span>
        </h1>
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

      <div className={authStripes} aria-hidden="true">
        <span className={authStripe({ length: "long" })} />
        <span className={authStripe({ length: "medium" })} />
        <span className={authStripe({ length: "short" })} />
      </div>
    </aside>

    <main className={authMain}>
      <div className={authCard}>
        <BrandMark size="lg" className={authCardBrand} />
        <h2 className={authTitle}>{title}</h2>
        <p className={authSubtitle}>{subtitle}</p>
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;
