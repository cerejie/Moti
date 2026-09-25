import { z } from "zod";
import { codeMessage, codePattern } from "../../../utils/code.utils";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(60, "Keep the name under 60 characters"),
  code: z.string().trim().regex(codePattern, codeMessage),
  brand_ids: z.array(z.string()),
});

export type ICategoryRequest = z.infer<typeof categorySchema>;
