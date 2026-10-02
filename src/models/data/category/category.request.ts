import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(60),
});
export type ICategoryFormInput = z.infer<typeof categoryFormSchema>;
