import type { ReactNode } from "react";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ModalSize } from "../../../models/common/view.model";
import { sectionTitle } from "../../../styles/common/typography.styles";
import {
  detailSection,
  detailSectionHeader,
  detailSections,
} from "../../../styles/modal/detail.styles";
import { visibleDetailSections } from "../../../utils/detail.utils";
import AppModal from "./AppModal";
import DetailGrid from "./DetailGrid";

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
  // Rendered below the sections - a history list, related records.
  children?: ReactNode;
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
  children,
}: IProps<TRecord>) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      kind="detail"
      footer={footer}
    >
      {record && (
        <div className={detailSections}>
          {header}

          {visibleDetailSections(sections, record).map((section) => (
            <section key={section.key} className={detailSection}>
              <div className={detailSectionHeader}>
                {section.icon}
                <h3 className={sectionTitle}>{section.title}</h3>
              </div>

              <DetailGrid record={record} items={section.items} />
            </section>
          ))}

          {children}
        </div>
      )}
    </AppModal>
  );
};

export default DetailModal;
