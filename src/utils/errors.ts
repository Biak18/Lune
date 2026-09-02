/**
 * Normalize Supabase / network errors to user-friendly messages
 */

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const err = error as { message?: string; error_description?: string; msg?: string };
    const msg = err.message || err.error_description || err.msg;
    if (msg) {
      // Map common Supabase messages to friendlier variants
      const lower = msg.toLowerCase();
      if (lower.includes("invalid login credentials")) {
        return "Invalid email or password. Please try again.";
      }
      if (lower.includes("email not confirmed")) {
        return "Please confirm your email before signing in.";
      }
      if (lower.includes("user already registered") || lower.includes("already exists")) {
        return "An account with this email already exists.";
      }
      if (lower.includes("password should be at least")) {
        return msg;
      }
      if (lower.includes("network")) {
        return "Network error. Check your connection and try again.";
      }
      return msg;
    }
  }
  return "Something went wrong. Please try again.";
}
