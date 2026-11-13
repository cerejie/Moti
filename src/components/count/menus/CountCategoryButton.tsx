import { ListPlus } from "lucide-react";
import { useCountCategory } from "../../../hook/data/count/count.form.hook";
import AppButton from "../../common/button/AppButton";

// Shown once the list is filtered to a category: the whole shelf joins the count in one tap.
const CountCategoryButton = () => {
  const { categoryId, categoryName, pending, addCategory } = useCountCategory();

  if (!categoryId) return null;

  return (
    <AppButton variant="outline" size="lg" loading={pending} onPress={addCategory}>
      <ListPlus data-icon="inline-start" aria-hidden />
      Count all in {categoryName ?? "this category"}
    </AppButton>
  );
};

export default CountCategoryButton;
