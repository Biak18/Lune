import { supabase } from "@/lib/supabase";
import type { LoginPayload, RegisterPayload, ResetPasswordPayload } from "../types";

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
        { onConflict: "id" }
      );
      // Silently ignore profile errors if table not yet created (Phase 1 migration pending)
      if (profileError && __DEV__) {
        console.warn("[authService] profile upsert warning:", profileError.message);
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
      email.trim().toLowerCase()
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
};
