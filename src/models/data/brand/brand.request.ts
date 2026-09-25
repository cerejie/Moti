import { z } from "zod";
import { codeMessage, codePattern } from "../../../utils/code.utils";

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Enter a brand name").max(80, "Keep the name under 80 characters"),
  code: z.string().trim().regex(codePattern, codeMessage),
  category_ids: z.array(z.string()),
});

export type IBrandRequest = z.infer<typeof brandSchema>;
