import React, { createContext, useCallback, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

type AuthContextValue = {
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    } catch (e) {
      if (__DEV__) console.warn("[AuthProvider] getSession error", e);
      setSession(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [setLoading, setSession, setInitialized]);

  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, setLoading, setSession, setInitialized]);

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const value = useMemo(() => ({ isInitialized }), [isInitialized]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return React.useContext(AuthContext);
}
