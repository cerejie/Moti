import ContentView from "../../components/common/view/ContentView";
import MovementDetailPanel from "../../components/movement/panels/MovementDetailPanel";
import { ROUTES } from "../../routes/route.paths";

const MovementDetailView = () => (
  <ContentView back={{ label: "Stock history", path: ROUTES.movements }}>
    <MovementDetailPanel />
  </ContentView>
);

export default MovementDetailView;
