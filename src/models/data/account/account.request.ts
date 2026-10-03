import { z } from "zod";

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be at most 72 characters");

const emailField = z.string().trim().email("Enter a valid email");

const fullNameField = z.string().trim().min(1, "Enter the full name").max(120);

const passwordsMatch = (values: { password: string; confirm_password: string }) =>
  values.password === values.confirm_password;

const passwordMismatchIssue = {
  path: ["confirm_password"],
  message: "Passwords do not match",
};

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export type ILoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: fullNameField,
    email: emailField,
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type IRegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type IForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;
