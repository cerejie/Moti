import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { stockQueryKeys } from "../../../keys/query.keys";
import { countModalKey } from "../../../keys/modal.keys";
import {
  countFormSchema,
  type ICountFormInput,
  type ICountLine,
} from "../../../models/data/count/count.request";
import inventoryServices from "../../../services/data/inventory.services";
import movementServices from "../../../services/data/movement.services";
import {
  selectCountBranch,
  selectCountLines,
  selectCountStep,
  useCountStore,
} from "../../../store/data/count/count.store";
import { countPickTableKey } from "../../../keys/table.keys";
import { formatCount } from "../../../utils/format.utils";
import { useFilters } from "../../common/filter.hook";
import { usePushedRoute } from "../../layout/navigation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";
import { useCategoryOptions } from "../category/category.list.hook";

export const countDifference = (line: ICountLine) =>
  line.counted === null ? 0 : line.counted - line.item.on_hand;

export const useCount = () => {
  const lines = useCountStore(selectCountLines);
  const branchId = useCountStore(selectCountBranch);
  const step = useCountStore(selectCountStep);
  const add = useCountStore((state) => state.add);
  const addMany = useCountStore((state) => state.addMany);
  const setCounted = useCountStore((state) => state.setCounted);
  const remove = useCountStore((state) => state.remove);
  const setStep = useCountStore((state) => state.setStep);
  const clear = useCountStore((state) => state.clear);

  const differences = lines.filter((line) => countDifference(line) !== 0);

  return {
    lines,
    branchId,
    step,
    differences,
    itemCount: lines.length,
    uncountedCount: lines.filter((line) => line.counted === null).length,
    add,
    addMany,
    setCounted,
    remove,
    setStep,
    clear,
  };
};

export const useStockCountForm = () => {
  const { modal, closeModal } = useModal(countModalKey);
  const { goBack } = usePushedRoute();
  const count = useCount();

  const form = useForm<ICountFormInput>({
    resolver: zodResolver(countFormSchema),
    defaultValues: { note: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ note: "" });
  }, [modal.visible, reset]);

  // A count where every shelf matches records nothing, so nothing is sent.
  const mutation = useAppMutation(
    (values: ICountFormInput) =>
      count.differences.length === 0
        ? Promise.resolve({ queued: false })
        : count.branchId
          ? movementServices.recordCount(count.branchId, count.differences, values.note)
          : Promise.reject(new Error("Pick the branch you are counting")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage:
        count.differences.length === 0
          ? "Every count matched the app. Nothing changed."
          : `Stock corrected for ${formatCount(count.differences.length, "product")}.`,
      queuedMessage: "Saved on this device. Waiting to sync.",
      // Back to where the check was started; a toast says it worked, nothing to dismiss.
      onSuccess: () => {
        count.clear();
        closeModal();
        goBack();
      },
    },
  );

  const close = () => {
    mutation.reset();
    count.setStep("count");
    closeModal();
  };

  return {
    open: modal.visible,
    count,
    form,
    mutation,
    canReview: count.itemCount > 0 && count.uncountedCount === 0,
    review: () => count.setStep("review"),
    back: () => {
      mutation.reset();
      count.setStep("count");
    },
    close,
    onSubmit: (values: ICountFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) close();
    },
  };
};

// "Count all in <category>": with the picker filtered to a category, every active item
// of it joins the count at once.
export const useCountCategory = () => {
  const { filters } = useFilters<{ categoryId?: string }>(countPickTableKey);
  const { options } = useCategoryOptions();
  const addMany = useCountStore((state) => state.addMany);
  const { writeBranch } = useActiveBranch();
  const categoryId = filters.categoryId;

  const mutation = useAppMutation(
    ({ id, branchId }: { id: string; branchId: string }) =>
      inventoryServices.getByCategory(id, branchId).then((items) => ({ items, branchId })),
    {
      onSuccess: ({ items, branchId }) => {
        addMany(branchId, items);
        toast.success(`${formatCount(items.length, "product")} added to the check`);
      },
    },
  );

  return {
    categoryId,
    categoryName: options.find((option) => option.value === categoryId)?.label,
    pending: mutation.isPending,
    addCategory: () => {
      if (categoryId && writeBranch) mutation.mutate({ id: categoryId, branchId: writeBranch.id });
    },
  };
};
