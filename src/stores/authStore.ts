import { create } from "zustand";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthProfile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: AuthProfile | null;

  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  user: null,

  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,

  setTokens: ({ accessToken, refreshToken, expiresIn }) =>
    set({
      accessToken,
      refreshToken,
      expiresIn,
      isAuthenticated: true,
      isLoading: false,
    }),

  setUser: (user) =>
    set({
      user,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setInitialized: (isInitialized) =>
    set({
      isInitialized,
    }),

  reset: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      isLoading: false,
      isInitialized: true,
      isAuthenticated: false,
    }),
}));
