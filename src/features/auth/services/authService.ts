import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "../types";

// Required for WebBrowser auth session to complete correctly on iOS/Android
WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async signIn({ email, password }: LoginPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp({ email, password, fullName }: RegisterPayload) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || null,
        },
      },
    });
    if (error) throw error;

    // Attempt to create profile row if user was created.
    // This is safe to fail if RLS or trigger already handles it.
    // Profiles table expects id = auth.users.id
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: fullName?.trim() || null,
          role: "customer",
        },
        { onConflict: "id" },
      );
      // Silently ignore profile errors if table not yet created (Phase 1 migration pending)
      if (profileError && __DEV__) {
        console.warn(
          "[authService] profile upsert warning:",
          profileError.message,
        );
      }
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword({ email }: ResetPasswordPayload) {
    // No redirect URL needed for MVP; Supabase will send email with recovery link.
    // For Expo, you could add redirectTo via Linking.createURL if handling deep links.
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );
    if (error) throw error;
    return data;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Initiate Google OAuth via Supabase.
   * - Web: Supabase redirects the browser (default implicit/pkce flow).
   // - Native (Expo): uses WebBrowser.openAuthSessionAsync + PKCE code exchange.
   * Requires Supabase Auth > Providers > Google enabled and redirect URL whitelisted:
   *   Site URL + `dressshop://` (scheme from app.json) or Expo proxy when using Expo Go.
   */
  async signInWithGoogle() {
    // Web: let Supabase handle redirect directly
    if (Platform.OS === "web") {
      // Use current origin so Supabase redirects back to where Expo Web is running
      // (http://localhost:8081) instead of default Site URL http://localhost:3000.
      const redirectTo =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
      return data;
    }

    // Native: PKCE flow via WebBrowser
    const redirectTo = Linking.createURL("/"); // → dressshop:/// or exp:// with proxy
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Google sign-in failed to return URL");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "dismiss" || result.type === "cancel") {
      throw new Error("Google sign-in was cancelled");
    }
    if (result.type !== "success" || !result.url) {
      throw new Error("Google sign-in failed");
    }

    // PKCE: URL contains `code` query param
    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    // Older implicit flow may return tokens in hash fragment; handle as fallback
    if (code) {
      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      return exchangeData;
    }

    // Fallback: extract tokens from fragment if present (e.g. #access_token=...)
    const fragment = result.url.split("#")[1];
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        if (sessionError) throw sessionError;
        return sessionData;
      }
    }

    // If no code/tokens, rely on onAuthStateChange having fired via deep link;
    // fetch current session as final check
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session)
      throw new Error("Google sign-in completed but no session found");
    return { session } as unknown as typeof data;
  },
};
