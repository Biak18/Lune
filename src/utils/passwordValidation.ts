// src/utils/passwordValidation.ts
// Single source of truth for password requirement checks used by
// PasswordRequirements.tsx and future validation logic.
// No external dependencies.

export const PASSWORD_MIN_LENGTH = 6;

export type PasswordRequirementsResult = {
  length: boolean;
  uppercase: boolean;
  special: boolean;
  valid: boolean;
};

/**
 * Evaluate individual password requirements.
 * - length: >= minLength
 * - uppercase: at least one A-Z
 * - special: at least one non-alphanumeric (e.g. !@#$%)
 */
export function getPasswordRequirements(
  password: string,
  minLength: number = PASSWORD_MIN_LENGTH
): PasswordRequirementsResult {
  const length = password.length >= minLength;
  const uppercase = /[A-Z]/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  const valid = length && uppercase && special;
  return { length, uppercase, special, valid };
}

export function isPasswordValid(
  password: string,
  minLength: number = PASSWORD_MIN_LENGTH
): boolean {
  return getPasswordRequirements(password, minLength).valid;
}

/**
 * Detailed validation returning a user-facing error string.
 * By default requires all three rules; set `strict` false to only require length.
 */
export function validatePasswordDetailed(
  password: string,
  minLength: number = PASSWORD_MIN_LENGTH,
  strict = false
): string | null {
  const req = getPasswordRequirements(password, minLength);
  if (!req.length) return `Password must be at least ${minLength} characters`;
  if (strict) {
    if (!req.uppercase) return "Password must include at least one uppercase letter";
    if (!req.special) return "Password must include at least one special character";
  }
  return null;
}
