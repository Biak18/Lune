import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { router } from "expo-router";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.desc}>Sign in to access admin.</Text>
        <Button title="Sign in" onPress={() => router.push("/auth/login" as any)} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.foreground} />
        <Text style={styles.desc}>Checking permissions…</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Not authorized</Text>
        <Text style={styles.desc}>Your account is not an admin. Ask an admin to set profiles.role = &apos;admin&apos; for your user. Current: {user.email} ({user.id.slice(0, 8)}…)</Text>
        <Button title="Go to shop" onPress={() => router.replace("/(tabs)/shop" as any)} style={{ marginTop: spacing.lg }} />
        <Button title="My orders" variant="secondary" onPress={() => router.push("/orders" as any)} style={{ marginTop: 8 }} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.foreground,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
});
