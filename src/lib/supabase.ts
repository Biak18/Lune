import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { polyfillWebCrypto } from "expo-standard-web-crypto";
import * as Crypto from "expo-crypto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "@/config/env";
import type { Database } from "@/types/database";

// Polyfill WebCrypto for Supabase PKCE S256 (Expo Go = JS only, no native rebuild)
// expo-standard-web-crypto gives getRandomValues; subtle.digest needs expo-crypto
polyfillWebCrypto();
if (typeof globalThis.crypto !== "undefined" && !(globalThis.crypto as any).subtle) {
  (globalThis.crypto as any).subtle = {
    digest: async (algorithm: string | { name: string }, data: ArrayBuffer) => {
      const alg = typeof algorithm === "string" ? algorithm : (algorithm as any).name;
      if (alg.toLowerCase() !== "sha-256" && alg.toLowerCase() !== "sha256") {
        throw new Error(`Unsupported algorithm ${alg}`);
      }
      // data is ArrayBuffer of code_verifier UTF8 bytes
      let str: string;
      try {
        str = new TextDecoder().decode(data as ArrayBuffer);
      } catch {
        const bytes = new Uint8Array(data as ArrayBuffer);
        str = String.fromCharCode(...bytes);
      }
      const base64 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, str, {
        encoding: Crypto.CryptoEncoding.BASE64,
      });
      // base64 -> ArrayBuffer (atob provided by react-native-url-polyfill)
      const binary = (globalThis as any).atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    },
  };
}

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
