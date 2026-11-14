import { z } from "zod";

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a branch name").max(60),
});
export type IBranchFormInput = z.infer<typeof branchFormSchema>;
