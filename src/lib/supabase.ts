import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "@/config/env";
import type { Database } from "@/types/database";

const SUPABASE_URL = env.supabaseUrl;
const SUPABASE_ANON_KEY = env.supabaseAnonKey;

// Allow app to run without credentials (shows helpful error UI)
// but log warning in dev.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (__DEV__) {
    console.warn(
      "[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Auth will not work until env is configured. See .env.example"
    );
  }
}

// Fallback dummy values allow client creation without crashing when env missing.
// Requests will fail with auth errors which we surface to user.
const url = SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web needs to parse ?code=... from redirect URL to exchange for session.
    // Native uses WebBrowser.openAuthSessionAsync + manual exchange, so false there.
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});
