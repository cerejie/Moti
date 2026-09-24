import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ModalSize } from "../../../models/common/view.model";
import {
  detailGrid,
  detailItem,
  detailItemWide,
  detailSection,
  detailSectionHeader,
  detailSections,
} from "../../../styles/modal/detail.styles";
import {
  detailLabel,
  detailValue,
  sectionTitle,
} from "../../../styles/common/typography.styles";
import AppModal from "./AppModal";

type IProps<TRecord> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: ModalSize;
  record: TRecord | null | undefined;
  sections: IDetailSection<TRecord>[];
  footer?: ReactNode;
  // Rendered above the sections - a stepper, a status banner, a timeline.
  header?: ReactNode;
};

const DetailModal = <TRecord,>({
  open,
  onOpenChange,
  title,
  description,
  size = "lg",
  record,
  sections,
  footer,
  header,
}: IProps<TRecord>) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={footer}
    >
      {record && (
        <div className={detailSections}>
          {header}

          {sections.map((section) => (
            <section key={section.key} className={detailSection}>
              <div className={detailSectionHeader}>
                {section.icon}
                <h3 className={sectionTitle}>{section.title}</h3>
              </div>

              <dl className={detailGrid}>
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      detailItem,
                      (item.span ?? 1) > 1 && detailItemWide,
                    )}
                  >
                    <dt className={detailLabel}>{item.label}</dt>
                    <dd className={detailValue}>{item.render(record)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </AppModal>
  );
};

export default DetailModal;
