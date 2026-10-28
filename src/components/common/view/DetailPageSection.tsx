import type { ReactNode } from "react";
import {
  detailPageSection,
  detailPageSectionTitle,
} from "../../../styles/view/detailPage.styles";

type IProps = {
  title: string;
  children: ReactNode;
};

const DetailPageSection = ({ title, children }: IProps) => (
  <section className={detailPageSection}>
    <h2 className={detailPageSectionTitle}>{title}</h2>
    {children}
  </section>
);

export default DetailPageSection;
