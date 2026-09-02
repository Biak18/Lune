import { z } from "zod";

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function validateLoginInput(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  return errors;
}

export function validateRegisterInput(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (fullName.trim().length > 0 && fullName.trim().length < 2) {
    errors.fullName = "Name must be at least 2 characters";
  }
  if (!email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email";
  const pwError = validatePassword(password);
  if (pwError) errors.password = pwError;
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

// --- Zod schemas for react-hook-form (preferred for new code) ---
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .optional()
      .refine(
        (v) => !v || v.trim().length === 0 || v.trim().length >= 2,
        "Name must be at least 2 characters"
      ),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
