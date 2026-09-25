import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type ISignInRequest = z.infer<typeof signInSchema>;

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(72, "Keep it under 72 characters"),
    confirm: z.string().min(1, "Type the new password again"),
  })
  .refine((values) => values.password === values.confirm, {
    message: "The passwords don't match",
    path: ["confirm"],
  });

export type IChangePasswordRequest = z.infer<typeof changePasswordSchema>;
