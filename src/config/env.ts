/**
 * Environment configuration
 * Public Supabase credentials are safe to expose per Supabase security model.
 * Never add service_role keys here.
 */

function getEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key] ?? fallback;
  return value;
}

export const env = {
  supabaseUrl: getEnv("EXPO_PUBLIC_SUPABASE_URL", "") ?? "",
  supabaseAnonKey: getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "") ?? "",
  isSupabaseConfigured: () => {
    return Boolean(
      process.env.EXPO_PUBLIC_SUPABASE_URL &&
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );
  },
};

// Web polyfill handled via react-native-url-polyfill/auto in supabase client

