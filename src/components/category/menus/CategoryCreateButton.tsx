import { Plus } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { categoryFormModalKey } from "../../../keys/modal.keys";
import type { ICategory } from "../../../models/data/category/category.response";
import AppButton from "../../common/button/AppButton";

const CategoryCreateButton = () => {
  const { openModal } = useModal<ICategory>(categoryFormModalKey);

  return (
    <AppButton onPress={() => openModal()}>
      <Plus />
      Add category
    </AppButton>
  );
};

export default CategoryCreateButton;
