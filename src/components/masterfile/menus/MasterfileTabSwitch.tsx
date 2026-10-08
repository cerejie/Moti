import type { MasterfileTab } from "../../../enums/masterfile.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { masterfileTabKey } from "../../../keys/table.keys";
import type { ISegmentOption } from "../../../models/common/segment.model";
import ContextSwitch from "../../common/view/ContextSwitch";

const tabOptions: ISegmentOption<MasterfileTab>[] = [
  { key: "categories", label: "Categories" },
  { key: "brands", label: "Brands" },
];

const MasterfileTabSwitch = () => {
  const { filters, setFilters } = useFilters<{ tab?: MasterfileTab }>(masterfileTabKey);

  return (
    <ContextSwitch
      label="Masterfile"
      value={filters.tab ?? "categories"}
      options={tabOptions}
      onChange={(next) => setFilters({ tab: next })}
    />
  );
};

export default MasterfileTabSwitch;
