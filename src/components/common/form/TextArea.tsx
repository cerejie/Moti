import type { ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";

type IProps = ComponentProps<typeof Textarea>;

// Multi-line text control for the rows that are not built from an IFieldConfig.
const TextArea = (props: IProps) => {
  return <Textarea {...props} />;
};

export default TextArea;
