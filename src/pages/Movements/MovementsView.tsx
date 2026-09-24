import ContentView from "../../components/common/view/ContentView";
import MovementsPanel from "../../components/movement/panels/MovementsPanel";

const MovementsView = () => (
  <ContentView title="Stock movements" subtitle="Every sale, restock and adjustment, newest first">
    <MovementsPanel />
  </ContentView>
);

export default MovementsView;
