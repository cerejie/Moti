import CategoryCreateButton from "../../components/category/menus/CategoryCreateButton";
import CategoryFormModal from "../../components/category/modal/CategoryFormModal";
import CategoryTable from "../../components/category/tables/CategoryTable";
import ContentView from "../../components/common/view/ContentView";
import { ROUTES } from "../../routes/route.paths";

const CategoriesView = () => (
  <ContentView
    back={{ label: "Inventory", path: ROUTES.inventory }}
    actions={<CategoryCreateButton />}
  >
    <CategoryTable />
    <CategoryFormModal />
  </ContentView>
);

export default CategoriesView;
