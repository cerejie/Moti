import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { stockQueryKeys } from "../../../keys/query.keys";
import { countModalKey, countSuccessModalKey } from "../../../keys/modal.keys";
import {
  countFormSchema,
  type ICountFormInput,
  type ICountLine,
} from "../../../models/data/count/count.request";
import inventoryServices from "../../../services/data/inventory.services";
import movementServices from "../../../services/data/movement.services";
import {
  selectCountLines,
  selectCountStep,
  useCountStore,
} from "../../../store/data/count/count.store";
import { countPickTableKey } from "../../../keys/table.keys";
import { formatCount } from "../../../utils/format.utils";
import { useFilters } from "../../common/filter.hook";
import { useModal, useModalActions } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useCategoryOptions } from "../category/category.list.hook";

// What the success prompt shows once the count is gone.
export interface ICountReceipt {
  itemCount: number;
  differenceCount: number;
  queued: boolean;
}

export const countDifference = (line: ICountLine) =>
  line.counted === null ? 0 : line.counted - line.item.on_hand;

export const useCount = () => {
  const lines = useCountStore(selectCountLines);
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
  const { openModal } = useModalActions();
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
      count.differences.length > 0
        ? movementServices.recordCount(count.differences, values.note)
        : Promise.resolve({ queued: false }),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      onSuccess: (result) => {
        const receipt: ICountReceipt = {
          itemCount: count.itemCount,
          differenceCount: count.differences.length,
          queued: result.queued,
        };
        count.clear();
        closeModal();
        openModal(countSuccessModalKey, receipt);
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
  const categoryId = filters.categoryId;

  const mutation = useAppMutation(
    (id: string) => inventoryServices.getByCategory(id),
    {
      onSuccess: (items) => {
        addMany(items);
        toast.success(`${formatCount(items.length, "item")} added to the count`);
      },
    },
  );

  return {
    categoryId,
    categoryName: options.find((option) => option.value === categoryId)?.label,
    pending: mutation.isPending,
    addCategory: () => {
      if (categoryId) mutation.mutate(categoryId);
    },
  };
};
