/**
 * Normalize .NET ProblemDetails / network errors to user-friendly messages.
 * Backend shape: { title, detail, status, errors?: Record<string, string[]> }
 */

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      error_description?: string;
      msg?: string;
      detail?: string;
      title?: string;
    };
    const msg =
      err.detail || err.message || err.error_description || err.msg || err.title;
    if (msg) {
      const lower = msg.toLowerCase();
      if (
        lower.includes("invalid email or password") ||
        lower.includes("invalid login") ||
        lower.includes("authentication failed")
      ) {
        return "Invalid email or password. Please try again.";
      }
      if (lower.includes("refresh token")) {
        return "Your session expired. Please sign in again.";
      }
      if (lower.includes("already exists")) {
        return "An account with this email already exists.";
      }
      if (lower.includes("network") || lower.includes("fetch")) {
        return "Network error. Check your connection and try again.";
      }
      return msg;
    }
  }
  return "Something went wrong. Please try again.";
}
