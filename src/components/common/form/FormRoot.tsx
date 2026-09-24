import type { ReactNode } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

type IProps<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>;
  onSubmit: SubmitHandler<TValues>;
  id?: string;
  className?: string;
  children?: ReactNode;
};

// The react-hook-form provider plus the <form> element, for inline forms and
// EntityFormModal alike. FormField reads the form through this context.
const FormRoot = <TValues extends FieldValues>({
  form,
  onSubmit,
  id,
  className,
  children,
}: IProps<TValues>) => {
  return (
    <FormProvider {...form}>
      <form
        id={id}
        noValidate
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default FormRoot;
