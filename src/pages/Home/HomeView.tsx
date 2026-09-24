import { Bike } from "lucide-react";
import ContentView from "../../components/common/view/ContentView";
import StateBox from "../../components/common/status/StateBox";

// Placeholder until Phase 1 replaces it with the role-based home screen.
const HomeView = () => (
  <ContentView title="Home" subtitle="Inventory for your motorcycle shop">
    <StateBox icon={<Bike />} title="Moti is being set up">
      Sign-in, inventory and stock tracking arrive in the next phases.
    </StateBox>
  </ContentView>
);

export default HomeView;
