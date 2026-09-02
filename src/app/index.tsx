import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Redirect, router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { getAuthErrorMessage } from "@/utils/errors";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useLogoutMutation();

  // Redirect to login when not authenticated
  if (isInitialized && !isLoading && !session) {
    return <Redirect href="/auth/login" />;
  }

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={styles.loadingText}>Loading boutique...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/auth/login"),
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Dress Shop</Text>
        <Text style={styles.title}>You’re signed in</Text>
        <Text style={styles.subtitle}>
          Session persistence is active. Close and reopen the app — you’ll remain
          signed in via secure storage.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{user?.email ?? "—"}</Text>
        {user?.user_metadata?.full_name ? (
          <Text style={styles.meta}>Name: {String(user.user_metadata.full_name)}</Text>
        ) : null}
        <Text style={styles.meta}>User ID: {user?.id.slice(0, 8)}…</Text>
        <Text style={styles.meta}>
          Email confirmed: {user?.email_confirmed_at ? "yes" : "pending"}
        </Text>
      </View>

      {logout.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{getAuthErrorMessage(logout.error)}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Sign out"
          onPress={handleLogout}
          loading={logout.isPending}
          variant="primary"
        />
        <Text style={styles.hint}>
          This preview proves the auth flow. Catalog, cart and orders will appear in later
          phases — this screen will become the Profile / Home tab.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 14,
    color: colors.muted,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.mutedLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    paddingTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing["2xl"],
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: "#F5C6C2",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  actions: {
    gap: 12,
    paddingTop: 8,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedLight,
    textAlign: "center",
  },
});
