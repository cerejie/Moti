import type { ReactNode } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type {
  IFieldConfig,
  IFieldSection,
} from "../../../models/common/field.model";
import type { ModalSize } from "../../../models/common/view.model";
import { modalForm } from "../../../styles/modal/modal.styles";
import { formStack } from "../../../styles/form/formSection.styles";
import AppModal from "../modal/AppModal";
import ErrorState from "../status/ErrorState";
import FormField from "./FormField";
import FormFieldGrid from "./FormFieldGrid";
import FormRoot from "./FormRoot";
import FormSection from "./FormSection";

type IProps<TValues extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: ModalSize;
  form: UseFormReturn<TValues>;
  // Either a flat field list or grouped sections; sections win when both are given.
  fields?: IFieldConfig<TValues>[];
  sections?: IFieldSection<TValues>[];
  onSubmit: SubmitHandler<TValues>;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  // API failure, shown above the fields and kept separate from field errors.
  error?: string | null;
  children?: ReactNode;
};

const EntityFormModal = <TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  form,
  fields,
  sections,
  onSubmit,
  submitting = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  error,
  children,
}: IProps<TValues>) => {
  const formId = `${title.replace(/\s+/g, "-").toLowerCase()}-form`;
  // A field can hide itself based on the current values, so the whole form is
  // watched rather than each field subscribing separately.
  const values = useWatch({ control: form.control }) as TValues;

  const visibleFields = (list: IFieldConfig<TValues>[]) =>
    list.filter((config) => !config.hidden?.(values));

  const renderFields = (list: IFieldConfig<TValues>[]) => (
    <FormFieldGrid>
      {visibleFields(list).map((config) => (
        <FormField<TValues>
          key={String(config.name)}
          config={config}
          control={form.control}
        />
      ))}
    </FormFieldGrid>
  );

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button
            variant="outline"
            isDisabled={submitting}
            onPress={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          {/* The footer sits outside the <form>, so form= wires the submit. */}
          <Button type="submit" form={formId} isDisabled={submitting}>
            {submitting && <Spinner />}
            {submitLabel}
          </Button>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={modalForm}>
        {error && <ErrorState message={error} />}

        {sections ? (
          <div className={formStack}>
            {sections.map((section) => (
              <FormSection
                key={section.key}
                title={section.title}
                description={section.description}
              >
                {renderFields(section.fields)}
              </FormSection>
            ))}
          </div>
        ) : (
          renderFields(fields ?? [])
        )}

        {children}
      </FormRoot>
    </AppModal>
  );
};

export default EntityFormModal;
