import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(60, "Keep the name under 60 characters"),
});

export type ICategoryRequest = z.infer<typeof categorySchema>;
