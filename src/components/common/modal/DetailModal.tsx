import type { ReactNode } from "react";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ModalSize } from "../../../models/common/view.model";
import { detailSections } from "../../../styles/modal/detail.styles";
import AppModal from "./AppModal";
import DetailSections from "./DetailSections";

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

          <DetailSections record={record} sections={sections} />

          {children}
        </div>
      )}
    </AppModal>
  );
};

export default DetailModal;
