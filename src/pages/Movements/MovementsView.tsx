import ContentView from "../../components/common/view/ContentView";
import MovementTable from "../../components/movement/tables/MovementTable";

const MovementsView = () => (
  <ContentView title="Stock history" subtitle="Deliveries, counts and damage, newest first">
    <MovementTable />
  </ContentView>
);

export default MovementsView;
