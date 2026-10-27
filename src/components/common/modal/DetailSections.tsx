import type { IDetailSection } from "../../../models/common/detail.model";
import { sectionTitle } from "../../../styles/common/typography.styles";
import { detailSection, detailSectionHeader } from "../../../styles/modal/detail.styles";
import { visibleDetailSections } from "../../../utils/detail.utils";
import DetailGrid from "./DetailGrid";

type IProps<TRecord> = {
  record: TRecord;
  sections: IDetailSection<TRecord>[];
};

// The titled fact groups, shared by DetailModal and full-page record details.
const DetailSections = <TRecord,>({ record, sections }: IProps<TRecord>) => (
  <>
    {visibleDetailSections(sections, record).map((section) => (
      <section key={section.key} className={detailSection}>
        <div className={detailSectionHeader}>
          {section.icon}
          <h3 className={sectionTitle}>{section.title}</h3>
        </div>

        <DetailGrid record={record} items={section.items} />
      </section>
    ))}
  </>
);

export default DetailSections;
