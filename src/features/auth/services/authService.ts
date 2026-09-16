import { api, clearAccessToken, normalizeAuthPayload } from "@/lib/api";
import { authStorage } from "@/lib/authStorage";
import { useAuthStore } from "@/stores/authStore";

import type {
  AuthProfileDto,
  AuthResultDto,
  LoginPayload,
  RegisterPayload,
} from "../types";

export type RegisterResultDto = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number;
  emailConfirmationRequired: boolean;
};

function normalizeRegister(raw: any): RegisterResultDto {
  return {
    accessToken: raw?.accessToken ?? raw?.AccessToken ?? null,
    refreshToken: raw?.refreshToken ?? raw?.RefreshToken ?? null,
    expiresIn: raw?.expiresIn ?? raw?.ExpiresIn ?? 0,
    emailConfirmationRequired:
      raw?.emailConfirmationRequired ??
      raw?.EmailConfirmationRequired ??
      false,
  };
}

function normalizeProfile(raw: any): AuthProfileDto {
  return {
    id: String(raw?.id ?? raw?.Id ?? ""),
    fullName: raw?.fullName ?? raw?.FullName ?? null,
    avatarUrl: raw?.avatarUrl ?? raw?.AvatarUrl ?? null,
    role: raw?.role ?? raw?.Role ?? "customer",
    email: raw?.email ?? raw?.Email ?? null,
    createdAt: raw?.createdAt ?? raw?.CreatedAt ?? "",
    updatedAt: raw?.updatedAt ?? raw?.UpdatedAt ?? "",
  };
}

export const authService = {
  async signIn({ email, password }: LoginPayload): Promise<AuthResultDto> {
    const raw = await api.post<unknown>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const data = normalizeAuthPayload(raw);

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Sign in failed. The server returned an empty token.");
    }

    await authStorage.saveTokens(data.accessToken, data.refreshToken);

    useAuthStore.getState().setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });

    // Best-effort profile hydration; login still succeeds without it.
    try {
      await authService.getCurrentProfile();
    } catch {
      // ignore — profile loads on next app start
    }

    return data;
  },

  async signUp({
    email,
    password,
    fullName,
  }: RegisterPayload): Promise<RegisterResultDto> {
    const raw = await api.post<unknown>("/auth/register", {
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName?.trim() || null,
    });

    const result = normalizeRegister(raw);

    // Direct sign-in when the backend issued a session.
    if (!result.emailConfirmationRequired && result.accessToken && result.refreshToken) {
      await authStorage.saveTokens(result.accessToken, result.refreshToken);

      useAuthStore.getState().setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn || 3600,
      });

      try {
        await authService.getCurrentProfile();
      } catch {
        // ignore
      }
    }

    return result;
  },

  async requestPasswordReset(email: string): Promise<void> {
    // Always 204 — never reveals whether the account exists.
    await api.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });
  },

  async getCurrentProfile(): Promise<AuthProfileDto> {
    const raw = await api.get<unknown>("/api/profiles/me");
    const profile = normalizeProfile(raw);
    useAuthStore.getState().setUser({
      id: profile.id,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      email: profile.email,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
    return profile;
  },

  async restoreSession(): Promise<boolean> {
    const { accessToken, refreshToken } = await authStorage.getTokens();
    if (!accessToken || !refreshToken) {
      return false;
    }
    useAuthStore.getState().setTokens({
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
    try {
      await authService.getCurrentProfile();
    } catch {
      // Token may be expired — leave tokens in place;
      // the next 401 will trigger refresh via apiFetch.
    }
    return true;
  },

  async signOut() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Server revoke is best-effort — local sign-out always proceeds.
    } finally {
      await clearAccessToken();
    }
  },
};
