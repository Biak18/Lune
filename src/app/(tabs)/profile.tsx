import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { router } from "expo-router";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const logout = useLogoutMutation();

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.desc}>Sign in to see orders, addresses and wishlist.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login")} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.user_metadata?.full_name ? <Text style={styles.meta}>Name: {String(user.user_metadata.full_name)}</Text> : null}
        <Text style={styles.meta}>User ID: {user?.id.slice(0, 8)}…</Text>
      </View>
      <Button title="Sign out" variant="secondary" onPress={() => logout.mutate(undefined, { onSuccess: () => router.replace("/auth/login") })} loading={logout.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.foreground,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
  },
});
