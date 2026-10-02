import { z } from "zod";
import { userRoleSchema } from "../../../enums/role.enum";

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be at most 72 characters");

const passwordsMatch = (values: { password: string; confirm_password: string }) =>
  values.password === values.confirm_password;

const passwordMismatchIssue = {
  path: ["confirm_password"],
  message: "Passwords do not match",
};

export const createUserSchema = z
  .object({
    full_name: z.string().trim().min(1, "Enter the full name").max(120),
    email: z.string().trim().email("Enter a valid email"),
    role: userRoleSchema,
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type ICreateUserInput = z.infer<typeof createUserSchema>;

export const setPasswordSchema = z
  .object({
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type ISetPasswordInput = z.infer<typeof setPasswordSchema>;

export type UserView = "all" | "pending" | "approved" | "rejected";
