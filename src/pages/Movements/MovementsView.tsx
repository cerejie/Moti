import ContentView from "../../components/common/view/ContentView";
import MovementTable from "../../components/movement/tables/MovementTable";
import { ROUTES } from "../../routes/route.paths";

const MovementsView = () => (
  <ContentView
    title="Stock history"
    subtitle="Every audited stock change: added stock, corrections, damage and sales"
    back={{ label: "Stocks", path: ROUTES.inventory }}
    layout="fill"
  >
    <MovementTable />
  </ContentView>
);

export default MovementsView;
