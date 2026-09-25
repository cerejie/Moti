import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Controller, useFormContext, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import type { IFieldConfig, IFieldOption } from "../../../models/common/field.model";
import {
  fieldInput,
  fieldRoot,
  fieldSelect,
} from "../../../styles/form/field.styles";
import {
  formFieldFull,
  formFieldHalf,
} from "../../../styles/form/formSection.styles";
import { requiredMark } from "../../../styles/common/typography.styles";
import {
  formatPhMobileInput,
  toPhMobileValue,
} from "../../../utils/format.utils";
import PasswordInput from "./PasswordInput";
import SelectInput from "./SelectInput";

const PESO_SIGN = "₱";

const PH_COUNTRY_CODE = "+63";

const EM_DASH = "—";

// Native option values can't be empty; this one marks the select's action entry.
const selectActionKey = "__action__";

// The control receives whatever the schema typed the value as, so each branch
// narrows it rather than asserting.
const asText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const asChecked = (value: unknown): boolean => value === true;

type IProps<TValues extends FieldValues> = {
  config: IFieldConfig<TValues>;
  control?: Control<TValues>;
  className?: string;
};

// The one place a field type becomes a control. A new input kind means a new
// IFieldType and a branch here - never a bespoke input in a page.
const FormField = <TValues extends FieldValues>({
  config,
  control,
  className,
}: IProps<TValues>) => {
  const context = useFormContext<TValues>();
  const isMobile = useIsMobile();

  const {
    type,
    label,
    placeholder,
    description,
    options = [],
    disabled,
    required,
    prefix,
    icon,
    autoComplete,
    mask,
    allowClear,
    searchable,
    selectAction,
  } = config;

  const fieldId = String(config.name);
  const spanClass = config.span === "full" ? formFieldFull : formFieldHalf;

  const renderControl = (
    bound: ControllerRenderProps<TValues, Path<TValues>>,
    invalid: boolean,
  ) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...bound}
            id={fieldId}
            aria-invalid={invalid}
            value={asText(bound.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        );

      case "password":
        return (
          <PasswordInput
            {...bound}
            id={fieldId}
            aria-invalid={invalid}
            value={asText(bound.value)}
            revealKey={`field-password:${fieldId}`}
            placeholder={placeholder}
            autoComplete={autoComplete ?? "current-password"}
            disabled={disabled}
          />
        );

      case "email":
        return (
          <Input
            {...bound}
            id={fieldId}
            aria-invalid={invalid}
            value={asText(bound.value)}
            type="email"
            inputMode="email"
            className={fieldInput}
            placeholder={placeholder}
            autoComplete={autoComplete ?? "email"}
            disabled={disabled}
          />
        );

      case "number":
      case "amount":
      case "phone": {
        const addon = prefix ?? (type === "amount" ? PESO_SIGN : undefined);
        const inputType =
          type === "phone" ? "tel" : type === "number" ? "number" : "text";
        const inputMode =
          type === "amount" ? "decimal" : type === "phone" ? "tel" : undefined;

        if (!addon) {
          return (
            <Input
              {...bound}
              id={fieldId}
              aria-invalid={invalid}
              value={asText(bound.value)}
              type={inputType}
              inputMode={inputMode}
              className={fieldInput}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
            />
          );
        }

        return (
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>{addon}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...bound}
              id={fieldId}
              aria-invalid={invalid}
              value={asText(bound.value)}
              type={inputType}
              inputMode={inputMode}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
            />
          </InputGroup>
        );
      }

      // The form holds 09XXXXXXXXX; the customer only types what follows +63.
      case "mobile":
        return (
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>{PH_COUNTRY_CODE}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...bound}
              id={fieldId}
              aria-invalid={invalid}
              value={formatPhMobileInput(asText(bound.value))}
              onChange={(event) =>
                bound.onChange(toPhMobileValue(event.target.value))
              }
              type="tel"
              inputMode="tel"
              placeholder={placeholder}
              autoComplete={autoComplete ?? "tel-national"}
              disabled={disabled}
            />
          </InputGroup>
        );

      case "select": {
        const value = asText(bound.value);

        // A phone gets the native wheel; it beats a popover list on touch.
        if (isMobile) {
          return (
            <NativeSelect
              id={fieldId}
              aria-invalid={invalid}
              name={bound.name}
              ref={bound.ref}
              value={value}
              onBlur={bound.onBlur}
              onChange={(event) => {
                // The action entry runs and the controlled value snaps back.
                if (event.target.value === selectActionKey) return selectAction?.onSelect();
                bound.onChange(event.target.value);
              }}
              disabled={disabled}
              className={fieldInput}
            >
              <NativeSelectOption value="">
                {placeholder ?? "Select"}
              </NativeSelectOption>
              {options.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
              {selectAction && (
                <NativeSelectOption value={selectActionKey}>
                  {selectAction.label}
                </NativeSelectOption>
              )}
            </NativeSelect>
          );
        }

        return (
          <SelectInput
            id={fieldId}
            value={value}
            onValueChange={bound.onChange}
            options={options}
            placeholder={placeholder ?? "Select"}
            disabled={disabled}
            invalid={invalid}
            label={label}
            allowClear={allowClear}
            searchable={searchable}
            action={selectAction}
          />
        );
      }

      case "multiselect": {
        const selected = asList(bound.value);

        return (
          <Combobox
            selectionMode="multiple"
            value={selected}
            onChange={(keys) => bound.onChange(keys.map(String))}
            onBlur={bound.onBlur}
            isDisabled={disabled}
            isInvalid={invalid}
            aria-label={label}
            allowsEmptyCollection
            className={fieldSelect}
          >
            <ComboboxChips>
              <ComboboxChipList<IFieldOption>>
                {(option) => (
                  <ComboboxChip id={option.value}>{option.label}</ComboboxChip>
                )}
              </ComboboxChipList>
              <ComboboxChipsInput
                id={fieldId}
                placeholder={selected.length === 0 ? (placeholder ?? "Select") : undefined}
              />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxList
                renderEmptyState={() => <ComboboxEmpty>No match found.</ComboboxEmpty>}
              >
                {options.map((option) => (
                  <ComboboxItem key={option.value} id={option.value} value={option}>
                    {option.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      }

      case "readonly":
        return (
          <Input
            {...bound}
            id={fieldId}
            value={asText(bound.value) || EM_DASH}
            className={fieldInput}
            readOnly
          />
        );

      default:
        return (
          <Input
            {...bound}
            id={fieldId}
            aria-invalid={invalid}
            value={asText(bound.value)}
            onChange={(event) =>
              bound.onChange(
                mask ? mask(event.target.value) : event.target.value,
              )
            }
            type="text"
            className={fieldInput}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
          />
        );
    }
  };

  const labelText = (
    <>
      {label}
      {required && <span className={requiredMark}>*</span>}
    </>
  );

  return (
    <Controller<TValues, Path<TValues>>
      control={control ?? context.control}
      name={config.name}
      render={({ field, fieldState }) =>
        // A checkbox reads as one line: the box, then its own label.
        type === "checkbox" ? (
          <Field
            orientation="horizontal"
            data-invalid={fieldState.invalid}
            className={cn(fieldRoot, spanClass, className)}
          >
            <Checkbox
              id={fieldId}
              isSelected={asChecked(field.value)}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isDisabled={disabled}
              isInvalid={fieldState.invalid}
            />
            <FieldContent>
              <FieldLabel htmlFor={fieldId}>{labelText}</FieldLabel>
              {description && <FieldDescription>{description}</FieldDescription>}
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        ) : (
          <Field
            data-invalid={fieldState.invalid}
            className={cn(fieldRoot, spanClass, className)}
          >
            <FieldLabel htmlFor={fieldId}>
              {icon}
              {labelText}
            </FieldLabel>
            {renderControl(field, fieldState.invalid)}
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </Field>
        )
      }
    />
  );
};

export default FormField;
