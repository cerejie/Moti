import DateRangeFilter from "../../common/filter/DateRangeFilter";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SegmentTabs from "../../common/view/SegmentTabs";
import {
  movementReasonLabels,
  movementTabLabels,
  type MovementReason,
  type MovementTab,
} from "../../../enums/movement.enum";
import {
  useMovementDateRange,
  useMovementTab,
} from "../../../hook/data/movement/movement.list.hook";
import { movementTableKey } from "../../../keys/table.keys";
import { movementToolbar } from "../../../styles/movement/movement.styles";

const tabs = (Object.keys(movementTabLabels) as MovementTab[]).map((key) => ({
  key,
  label: movementTabLabels[key],
}));

const reasonOptions = (Object.keys(movementReasonLabels) as MovementReason[]).map((reason) => ({
  value: reason,
  label: movementReasonLabels[reason],
}));

const MovementToolbar = () => {
  const { tab, setTab } = useMovementTab();
  const { range, today, setRange } = useMovementDateRange();

  return (
    <div className={movementToolbar}>
      <SegmentTabs
        label="Movement type"
        value={tab}
        onValueChange={(value) => setTab(value as MovementTab)}
        tabs={tabs}
      />

      <FilterToolbar
        filterKey={movementTableKey}
        searchKey={movementTableKey}
        searchPlaceholder="Search item name or code"
        controls={[
          {
            key: "reason",
            label: "Reason",
            placeholder: "All reasons",
            options: reasonOptions,
          },
        ]}
      >
        <DateRangeFilter
          label="Date range"
          value={range}
          onChange={setRange}
          maxDate={today ?? undefined}
        />
      </FilterToolbar>
    </div>
  );
};

export default MovementToolbar;
