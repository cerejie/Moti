import { useEffect, type ReactNode } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { get, useWatch } from "react-hook-form";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useSectionDisclosure } from "../../../hook/common/disclosure.hook";
import type {
  IFieldConfig,
  IFieldSection,
} from "../../../models/common/field.model";
import type { ConfirmKind } from "../../../models/common/modal.model";
import type { ModalSize } from "../../../models/common/view.model";
import { confirmAction, modalForm } from "../../../styles/modal/modal.styles";
import AppButton from "../button/AppButton";
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
  // "delete" paints the submit button destructive.
  submitKind?: ConfirmKind;
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
  submitKind = "confirm",
  cancelLabel = "Cancel",
  error,
  children,
}: IProps<TValues>) => {
  const formId = `${title.replace(/\s+/g, "-").toLowerCase()}-form`;
  const isCompact = useIsCompact();
  const disclosure = useSectionDisclosure(formId);
  const { resetSections } = disclosure;
  // A field can hide itself based on the current values, so the whole form is
  // watched rather than each field subscribing separately.
  const values = useWatch({ control: form.control }) as TValues;
  const { errors } = form.formState;

  // Every opening starts with all sections unfolded.
  useEffect(() => {
    if (open) resetSections();
  }, [open, resetSections]);

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

  const visibleSections = (sections ?? []).filter(
    (section) => visibleFields(section.fields).length > 0,
  );
  // Long phone forms fold by section; one holding an error never stays folded.
  const collapsible = isCompact && visibleSections.length > 1;
  const sectionHasError = (section: IFieldSection<TValues>) =>
    section.fields.some((config) => Boolean(get(errors, config.name)));

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      kind="form"
      footer={
        <>
          <AppButton
            variant="outline"
            disabled={submitting}
            onPress={() => onOpenChange(false)}
          >
            {cancelLabel}
          </AppButton>
          {/* The footer sits outside the <form>, so form= wires the submit. */}
          <AppButton
            type="submit"
            form={formId}
            className={confirmAction({ kind: submitKind })}
            loading={submitting}
          >
            {submitLabel}
          </AppButton>
        </>
      }
    >
      <FormRoot form={form} onSubmit={onSubmit} id={formId} className={modalForm}>
        {error && <ErrorState message={error} />}

        {sections
          ? visibleSections.map((section) => (
              <FormSection
                key={section.key}
                title={section.title}
                description={section.description}
                collapsible={collapsible}
                expanded={!disclosure.isCollapsed(section.key) || sectionHasError(section)}
                onExpandedChange={(expanded) =>
                  disclosure.setExpanded(section.key, expanded)
                }
              >
                {renderFields(section.fields)}
              </FormSection>
            ))
          : renderFields(fields ?? [])}

        {children}
      </FormRoot>
    </AppModal>
  );
};

export default EntityFormModal;
