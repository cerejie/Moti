import { Bike } from "lucide-react";
import ContentView from "../../components/common/view/ContentView";
import EmptyState from "../../components/common/status/EmptyState";

// Placeholder until Phase 1 replaces it with the role-based home screen.
const HomeView = () => (
  <ContentView title="Home" subtitle="Inventory for your motorcycle shop">
    <EmptyState
      icon={<Bike />}
      title="Moti is being set up"
      description="Sign-in, inventory and stock tracking arrive in the next phases."
    />
  </ContentView>
);

export default HomeView;
