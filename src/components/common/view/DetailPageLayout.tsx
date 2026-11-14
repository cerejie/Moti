import type { ReactNode } from "react";
import {
  detailPage,
  detailPageColumn,
  detailPageColumns,
  detailPageHeading,
  detailPageMeta,
  detailPageTitle,
} from "../../../styles/view/detailPage.styles";

type IProps = {
  title: ReactNode;
  meta?: string;
  // Facts and manage actions: under the main sections on phones, beside them on a desktop.
  aside?: ReactNode;
  children: ReactNode;
};

const DetailPageLayout = ({ title, meta, aside, children }: IProps) => (
  <div className={detailPage}>
    <div className={detailPageHeading}>
      <h1 className={detailPageTitle}>{title}</h1>
      {meta && <p className={detailPageMeta}>{meta}</p>}
    </div>
    <div className={detailPageColumns}>
      <div className={detailPageColumn}>{children}</div>
      {aside && <div className={detailPageColumn}>{aside}</div>}
    </div>
  </div>
);

export default DetailPageLayout;
