import ContentView from "../../components/common/view/ContentView";
import MovementTable from "../../components/movement/tables/MovementTable";

const MovementsView = () => (
  <ContentView title="Stock history" subtitle="Every sale, restock and correction, newest first">
    <MovementTable />
  </ContentView>
);

export default MovementsView;
