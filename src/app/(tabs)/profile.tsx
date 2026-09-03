import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useIsAdmin } from "@/features/admin/hooks/useIsAdmin";
import { useLoyaltyAccount, useLoyaltyTx } from "@/features/loyalty/hooks/useLoyalty";
import { LoyaltyCard } from "@/features/loyalty/components/LoyaltyCard";
import { RewardsList } from "@/features/loyalty/components/RewardsList";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { router } from "expo-router";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const logout = useLogoutMutation();
  const { data: isAdmin } = useIsAdmin();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyAccount();
  const { data: tx } = useLoyaltyTx();
  const { data: exclusive } = useProductsQuery(
    loyalty?.tier === "gold" || loyalty?.tier === "platinum" ? { style: "elegant", pageSize: 4 } : { style: "minimal", pageSize: 2 }
  );

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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.user_metadata?.full_name ? <Text style={styles.meta}>Name: {String(user.user_metadata.full_name)}</Text> : null}
        <Text style={styles.meta}>User ID: {user?.id.slice(0, 8)}…</Text>
      </View>

      <LoyaltyCard account={loyalty ?? null} isLoading={loyaltyLoading} />

      <RewardsList currentPoints={loyalty?.points ?? 0} />

      {tx && tx.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>Recent activity</Text>
          {tx.slice(0, 5).map((t) => (
            <View key={t.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View>
                <Text style={styles.meta}>{t.description ?? t.type}</Text>
                <Text style={{ fontSize: 11, color: colors.mutedLight }}>{new Date(t.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.meta, { color: t.points >= 0 ? colors.success : colors.error, fontWeight: "700" }]}>{t.points >= 0 ? `+${t.points}` : `${t.points}`}</Text>
            </View>
          ))}
        </View>
      )}

      {(loyalty?.tier === "gold" || loyalty?.tier === "platinum") && exclusive?.data?.length ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>Exclusive for {loyalty.tier} • Elegant collection</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {exclusive.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 12 }}>
        <Button title="My orders" onPress={() => router.push("/orders" as any)} />
        <Button title="Notifications" variant="secondary" onPress={() => router.push("/notifications" as any)} />
        {isAdmin && <Button title="Admin dashboard" variant="secondary" onPress={() => router.push("/admin" as any)} />}
        <Button title="Sign out" variant="secondary" onPress={() => logout.mutate(undefined, { onSuccess: () => router.replace("/auth/login") })} loading={logout.isPending} />
      </View>
    </ScrollView>
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
