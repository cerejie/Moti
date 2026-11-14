import BranchCreateButton from "../../components/branch/menus/BranchCreateButton";
import BranchFormModal from "../../components/branch/modal/BranchFormModal";
import BranchTable from "../../components/branch/tables/BranchTable";
import ContentView from "../../components/common/view/ContentView";

const BranchesView = () => (
  <ContentView
    title="Branches"
    subtitle="Each branch keeps its own stock. Archive a branch once it holds none."
    actions={<BranchCreateButton />}
  >
    <BranchTable />
    <BranchFormModal />
  </ContentView>
);

export default BranchesView;
