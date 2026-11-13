import { Trash2 } from "lucide-react";
import { countDifference, useStockCountForm } from "../../../hook/data/count/count.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { ICountFormInput } from "../../../models/data/count/count.request";
import {
  historyQuantity,
  itemIdentity,
  itemMeta,
  itemName,
} from "../../../styles/inventory/inventory.styles";
import {
  cartForm,
  cartList,
  cartRow,
  cartRowBottom,
  cartRowTop,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatNumber, formatSignedQuantity } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import QuantityInput from "../../common/form/QuantityInput";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";

const formId = "stock-count-form";

const noteField: IFieldConfig<ICountFormInput> = {
  name: "note",
  label: "Note",
  type: "textarea",
  span: "full",
  placeholder: "Optional, e.g. shelf A or monthly count",
};

// Two steps in one sheet: type what is on the shelf, then save only the differences.
const CountModal = () => {
  const { open, count, form, mutation, canReview, review, back, close, onSubmit, onOpenChange } =
    useStockCountForm();
  const reviewing = count.step === "review";
  const differenceCount = count.differences.length;

  const footer = reviewing ? (
    <>
      <AppButton variant="outline" disabled={mutation.isPending} onPress={back}>
        Back
      </AppButton>
      <AppButton type="submit" form={formId} loading={mutation.isPending}>
        {differenceCount > 0 ? "Save count" : "Finish"}
      </AppButton>
    </>
  ) : (
    <>
      <AppButton variant="outline" onPress={close}>
        Add more
      </AppButton>
      <AppButton disabled={!canReview} onPress={review}>
        Review
      </AppButton>
    </>
  );

  const renderCounting = () =>
    count.itemCount === 0 ? (
      <EmptyState description="Nothing picked yet. Add the items to count from the list." />
    ) : (
      <>
        <ul className={cartList}>
          {count.lines.map((line) => (
            <li key={line.item.id} className={cartRow}>
              <div className={cartRowTop}>
                <span className={itemIdentity}>
                  <span className={itemName}>{line.item.name}</span>
                  <span className={itemMeta}>{line.item.item_code}</span>
                </span>
                <AppButton
                  size="icon-lg"
                  variant="ghost"
                  aria-label={`Remove ${line.item.name}`}
                  onPress={() => count.remove(line.item.id)}
                >
                  <Trash2 />
                </AppButton>
              </div>
              <div className={cartRowBottom}>
                <span className={itemMeta}>
                  The app says {formatNumber(line.item.on_hand)} {line.item.unit}
                </span>
                <QuantityInput
                  label={`${line.item.name} on the shelf`}
                  placeholder="Shelf"
                  value={line.counted}
                  min={0}
                  allowEmpty
                  onChange={(next) => count.setCounted(line.item.id, next)}
                />
              </div>
            </li>
          ))}
        </ul>
        {count.uncountedCount > 0 && (
          <p className={itemMeta}>
            Type what is on the shelf for {formatCount(count.uncountedCount, "more item")}, or
            remove {count.uncountedCount === 1 ? "it" : "them"}.
          </p>
        )}
      </>
    );

  const renderReview = () => (
    <>
      {mutation.error && <AppAlert tone="danger">{mutation.error.message}</AppAlert>}

      {differenceCount === 0 ? (
        <EmptyState
          description={`All ${formatCount(count.itemCount, "item")} match the app. Nothing to record.`}
        />
      ) : (
        <>
          <p className={itemMeta}>
            {formatCount(differenceCount, "difference")} found in{" "}
            {formatCount(count.itemCount, "item")} counted. Matching items record nothing.
          </p>
          <ul className={cartList}>
            {count.differences.map((line) => {
              const difference = countDifference(line);
              return (
                <li key={line.item.id} className={cartRow}>
                  <div className={cartRowTop}>
                    <span className={itemIdentity}>
                      <span className={itemName}>{line.item.name}</span>
                      <span className={itemMeta}>
                        {formatNumber(line.item.on_hand)} → {formatNumber(line.counted ?? 0)}{" "}
                        {line.item.unit}
                      </span>
                    </span>
                    <span className={historyQuantity({ direction: difference > 0 ? "in" : "out" })}>
                      {formatSignedQuantity(difference)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <FormField config={noteField} />
    </>
  );

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={reviewing ? "Review count" : "Count stock"}
      description={
        reviewing
          ? "Only the differences are saved."
          : "Type what is on the shelf beside what the app says."
      }
      size="md"
      footer={footer}
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
        {reviewing ? renderReview() : renderCounting()}
      </FormRoot>
    </AppModal>
  );
};

export default CountModal;
