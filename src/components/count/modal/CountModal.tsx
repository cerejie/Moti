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
  cartRowTop,
} from "../../../styles/transaction/transaction.styles";
import { formatCount, formatSignedQuantity, formatQuantity } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import FormField from "../../common/form/FormField";
import FormRoot from "../../common/form/FormRoot";
import QuantityInput from "../../common/form/QuantityInput";
import AppModal from "../../common/modal/AppModal";
import AppAlert from "../../common/status/AppAlert";
import EmptyState from "../../common/status/EmptyState";
import DisclosureSection from "../../common/view/DisclosureSection";
import StockMathRow from "../../inventory/cards/StockMathRow";
import type { ICountLine } from "../../../models/data/count/count.request";

const formId = "stock-count-form";

const noteField: IFieldConfig<ICountFormInput> = {
  name: "note",
  label: "Reason or note",
  type: "textarea",
  span: "full",
  placeholder: "e.g. shelf A, monthly check",
};

const correctionText = (line: ICountLine) => {
  if (line.counted === null) return "—";
  const difference = countDifference(line);
  return difference === 0 ? "None" : formatSignedQuantity(difference);
};

// An absolute count, never an increment: type what is really there, the app works out the
// correction. Only the differences are saved, and the review shows exactly those.
const CountModal = () => {
  const { open, count, form, mutation, canReview, review, back, close, onSubmit, onOpenChange } =
    useStockCountForm();
  const reviewing = count.step === "review";
  const differenceCount = count.differences.length;

  const footer = reviewing ? (
    <>
      <AppButton variant="outline" disabled={mutation.isPending} onPress={back}>
        Back to counts
      </AppButton>
      <AppButton type="submit" form={formId} loading={mutation.isPending} disabled={mutation.isPending}>
        {differenceCount > 0 ? "Save stock correction" : "Finish"}
      </AppButton>
    </>
  ) : (
    <>
      <AppButton variant="outline" onPress={close}>
        Add more products
      </AppButton>
      <AppButton disabled={!canReview} onPress={review}>
        Review corrections
      </AppButton>
    </>
  );

  const renderCounting = () =>
    count.itemCount === 0 ? (
      <EmptyState description="Nothing picked yet. Add the products to check from the list." />
    ) : (
      <>
        <ul className={cartList} aria-label="Products to check">
          {count.lines.map((line) => (
            <li key={line.item.id} className={cartRow}>
              <div className={cartRowTop}>
                <span className={itemIdentity}>
                  <span className={itemName} title={line.item.name}>
                    {line.item.name}
                  </span>
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
              <StockMathRow
                cells={[
                  {
                    label: "App quantity",
                    content: formatQuantity(line.item.on_hand, line.item.unit),
                  },
                  {
                    label: "Actual counted",
                    content: (
                      <QuantityInput
                        label={`Actual quantity of ${line.item.name} counted, in ${line.item.unit}`}
                        placeholder="Count"
                        value={line.counted}
                        min={0}
                        allowEmpty
                        onChange={(next) => count.setCounted(line.item.id, next)}
                      />
                    ),
                  },
                  { label: "Correction", content: correctionText(line) },
                ]}
              />
            </li>
          ))}
        </ul>
        {count.uncountedCount > 0 && (
          <p className={itemMeta}>
            Type the actual quantity for {formatCount(count.uncountedCount, "more product")}, or
            remove {count.uncountedCount === 1 ? "it" : "them"}.
          </p>
        )}
      </>
    );

  const renderReview = () => (
    <>
      {mutation.error && (
        <AppAlert tone="danger" title="Not saved. Your counts are still here.">
          {mutation.error.message}
        </AppAlert>
      )}

      {differenceCount === 0 ? (
        <EmptyState
          description={`All ${formatCount(count.itemCount, "product")} match the app. Nothing to correct.`}
        />
      ) : (
        <>
          <p className={itemMeta}>
            {formatCount(differenceCount, "correction")} in{" "}
            {formatCount(count.itemCount, "product")} checked. Products that match record nothing.
            Sales made while you counted are kept.
          </p>
          <ul className={cartList} aria-label="Stock corrections">
            {count.differences.map((line) => {
              const difference = countDifference(line);
              return (
                <li key={line.item.id} className={cartRow}>
                  <div className={cartRowTop}>
                    <span className={itemIdentity}>
                      <span className={itemName} title={line.item.name}>
                        {line.item.name}
                      </span>
                      <span className={itemMeta}>
                        App quantity {formatQuantity(line.item.on_hand, line.item.unit)} · Counted{" "}
                        {formatQuantity(line.counted ?? 0, line.item.unit)}
                      </span>
                    </span>
                    <span
                      className={historyQuantity({ direction: difference > 0 ? "in" : "out" })}
                      aria-label={`Correction ${formatSignedQuantity(difference)} ${line.item.unit}`}
                    >
                      {formatSignedQuantity(difference)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <DisclosureSection title="Add reason or note (optional)">
        <FormField config={noteField} />
      </DisclosureSection>
    </>
  );

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={reviewing ? "Review corrections" : "Check stock count"}
      description={
        reviewing
          ? "Only the differences are saved, each as an audited stock correction."
          : "Type the actual quantity you counted beside the app's quantity."
      }
      size="md"
      kind="form"
      footer={footer}
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={cartForm}>
        {reviewing ? renderReview() : renderCounting()}
      </FormRoot>
    </AppModal>
  );
};

export default CountModal;
