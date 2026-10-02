import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a brand name").max(60),
});
export type IBrandFormInput = z.infer<typeof brandFormSchema>;
