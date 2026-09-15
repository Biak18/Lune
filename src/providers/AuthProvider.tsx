import React, { createContext, useCallback, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/authStore";

type AuthContextValue = {
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const reset = useAuthStore((s) => s.reset);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      // One-time cleanup: drop the legacy Supabase session left in
      // AsyncStorage by the pre-migration app so supabase-js never
      // attempts a background refresh against the old host.
      try {
        const keys = await AsyncStorage.getAllKeys();
        const legacy = keys.filter(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
        );
        if (legacy.length) {
          await AsyncStorage.multiRemove(legacy);
        }
      } catch {
        // non-fatal — stale key just stays until next launch
      }
      const restored = await authService.restoreSession();
      if (!restored) {
        reset();
      }
    } catch (e) {
      if (__DEV__) console.warn("[AuthProvider] restore error", e);
      reset();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setLoading, setInitialized, reset]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const value = useMemo(() => ({ isInitialized }), [isInitialized]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return React.useContext(AuthContext);
}
