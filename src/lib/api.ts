import { env } from "@/config/env";
import { useAuthStore } from "@/stores/authStore";
import { authStorage } from "./authStorage";

const BASE_URL = env.apiUrl.replace(/\/$/, "");

/**
 * Prevent multiple API requests from triggering
 * multiple refresh requests at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Get the current access token.
 */
export const getAccessToken = (): string | null => {
  return useAuthStore.getState().accessToken;
};

/**
 * Clear the current authentication state.
 */
export const clearAccessToken = async () => {
  await authStorage.clearTokens();
  useAuthStore.getState().reset();
};

/**
 * Endpoints that must never trigger a refresh retry.
 * Login failures return 401 ProblemDetails — retrying refresh
 * on those would loop and mask "invalid email or password".
 */
const NO_RETRY_PREFIXES = ["/auth/"];

const shouldRetry = (endpoint: string): boolean => {
  return !NO_RETRY_PREFIXES.some((p) => endpoint.startsWith(p));
};

/**
 * Refresh the access token using the refresh token.
 *
 * If multiple requests receive 401 at the same time,
 * they will share the same refresh request.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        await authStorage.clearTokens();

        useAuthStore.getState().reset();

        return null;
      }

      const raw = await response.json();
      const data = normalizeAuthPayload(raw);

      if (!data.accessToken || !data.refreshToken) {
        await authStorage.clearTokens();
        useAuthStore.getState().reset();
        return null;
      }

      await authStorage.saveTokens(data.accessToken, data.refreshToken);

      useAuthStore.getState().setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn ?? 3600,
      });

      return data.accessToken;
    } catch {
      await authStorage.clearTokens();

      useAuthStore.getState().reset();

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Backend is ASP.NET (PascalCase records) serialized to camelCase.
 * Accept both casings so a serializer change doesn't save undefined.
 */
export function normalizeAuthPayload(raw: any): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  return {
    accessToken: raw?.accessToken ?? raw?.AccessToken ?? "",
    refreshToken: raw?.refreshToken ?? raw?.RefreshToken ?? "",
    expiresIn: raw?.expiresIn ?? raw?.ExpiresIn ?? 3600,
  };
}

/**
 * Backend errors are RFC 7807 ProblemDetails:
 * { title, detail, status, instance, type }
 * Prefer `detail` (the human message) over `title`.
 */
function extractErrorMessage(body: any, status: number): string {
  if (!body || typeof body !== "object") {
    return `Request failed: ${status}`;
  }
  if (typeof body.detail === "string" && body.detail.trim()) {
    return body.detail;
  }
  // FluentValidation may return { errors: { Email: [...] } }
  if (body.errors && typeof body.errors === "object") {
    const msgs = Object.values(body.errors)
      .flat()
      .filter((v) => typeof v === "string") as string[];
    if (msgs.length) return msgs.join(" ");
  }
  if (typeof body.title === "string" && body.title.trim()) {
    return body.title;
  }
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  return `Request failed: ${status}`;
}

/**
 * Build request headers.
 */
const getHeaders = (
  options: RequestInit = {},
  token?: string | null,
): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const accessToken = token ?? useAuthStore.getState().accessToken;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.headers) {
    const custom =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : Array.isArray(options.headers)
          ? Object.fromEntries(options.headers)
          : (options.headers as Record<string, string>);
    for (const [key, value] of Object.entries(custom)) {
      headers[key] = String(value);
    }
  }

  return headers;
};

/**
 * Serialize query params, skipping undefined/null/empty.
 * Arrays repeat the key (?ids=a&ids=b) for ASP.NET model binding.
 */
export function toQueryString(
  params: Record<string, unknown> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && v !== "") {
          search.append(key, String(v));
        }
      }
    } else if (typeof value === "boolean") {
      search.append(key, value ? "true" : "false");
    } else {
      search.append(key, String(value));
    }
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/**
 * Main authenticated API request function.
 *
 * Flow:
 *
 * Request
 *   ↓
 * 200 → return data
 *
 * 401 (non-auth endpoint)
 *   ↓
 * refresh token
 *   ↓
 * new access token
 *   ↓
 * retry original request once
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(options, accessToken),
  });

  /**
   * Access token expired.
   *
   * Try to refresh once and retry the
   * original request. Never retry /auth/* itself.
   */
  if (
    response.status === 401 &&
    retry &&
    shouldRetry(endpoint)
  ) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(options, newAccessToken),
      });
    }
  }

  /**
   * Request still failed after refresh.
   */
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(extractErrorMessage(errorBody, response.status));
  }

  /**
   * No content.
   */
  if (response.status === 204) {
    return undefined as T;
  }

  /**
   * Some endpoints may return an empty/non-JSON response.
   */
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Public API.
 */
export const api = {
  get: <T>(endpoint: string, query?: Record<string, unknown>) =>
    apiFetch<T>(`${endpoint}${query ? toQueryString(query) : ""}`, {
      method: "GET",
    }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, {
      method: "DELETE",
    }),
};
