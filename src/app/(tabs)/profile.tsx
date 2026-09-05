import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useIsAdmin } from "@/features/admin/hooks/useIsAdmin";
import { useLoyaltyAccount, useLoyaltyTx } from "@/features/loyalty/hooks/useLoyalty";
import { LoyaltyCard } from "@/features/loyalty/components/LoyaltyCard";
import { RewardsList } from "@/features/loyalty/components/RewardsList";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { DevAccountSwitcher } from "@/features/auth/components/DevAccountSwitcher";
import { useOrdersQuery } from "@/features/orders/hooks/useOrders";
import { useFavoriteIdsQuery } from "@/features/wishlist/hooks/useWishlist";

function getInitials(email?: string, fullName?: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  }
  if (email) return email[0]?.toUpperCase() ?? "M";
  return "M";
}

function MenuRow({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={16} color={colors.foreground} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.mutedLight} />
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const logout = useLogoutMutation();
  const { data: isAdmin } = useIsAdmin();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyAccount();
  const { data: tx } = useLoyaltyTx();
  const { data: orders } = useOrdersQuery();
  const { data: wishlistIds } = useFavoriteIdsQuery();
  const { data: exclusive } = useProductsQuery(
    loyalty?.tier === "gold" || loyalty?.tier === "platinum" ? { style: "elegant", pageSize: 4 } : { style: "minimal", pageSize: 2 }
  );

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const email = user?.email ?? "";
  const initials = getInitials(email, fullName);
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.unauthContent} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View style={styles.unauthHeader}>
            <Text style={styles.wordmark}>LUNE</Text>
            <View style={styles.dot} />
            <Text style={styles.season}>Account</Text>
          </View>
          <View style={styles.unauthHero}>
            <View style={styles.unauthIconWrap}>
              <Ionicons name="person-outline" size={28} color={colors.muted} />
            </View>
            <Text style={styles.unauthTitle}>Your boutique awaits</Text>
            <Text style={styles.unauthDesc}>Sign in to track orders, save dresses, and keep your loyalty points in one place.</Text>
          </View>
          <View style={{ gap: 10 }}>
            <Button title="Sign in" onPress={() => router.push("/auth/login")} />
            <Button title="Create account" variant="secondary" onPress={() => router.push("/auth/register")} />
            <Pressable onPress={() => router.push("/(tabs)/shop" as any)} style={styles.browseLink} accessibilityRole="button">
              <Text style={styles.browseText}>Browse as guest</Text>
              <Ionicons name="arrow-forward" size={12} color={colors.muted} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        {/* Header — wordmark + bell */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={styles.wordmark}>LUNE</Text>
            <View style={styles.dot} />
            <Text style={styles.season}>Account</Text>
          </View>
          <Pressable onPress={() => router.push("/notifications" as any)} hitSlop={10} style={styles.bellBtn} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Identity — premium, airy */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.name} numberOfLines={1}>{fullName || email.split("@")[0] || "Member"}</Text>
            <Text style={styles.email} numberOfLines={1}>{email}</Text>
            {memberSince ? <Text style={styles.memberSince}>Member since {memberSince}</Text> : null}
          </View>
          {loyalty?.tier ? (
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{loyalty.tier}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats — quick overview */}
        <View style={styles.statsRow}>
          <Stat label="Orders" value={String(orders?.length ?? 0)} />
          <View style={styles.statDivider} />
          <Stat label="Wishlist" value={String(wishlistIds?.size ?? 0)} />
          <View style={styles.statDivider} />
          <Stat label="Points" value={String(loyalty?.points ?? 0)} />
        </View>

        {/* Boutique — grouped actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="bag-outline" label="My orders" sub={`${orders?.length ?? 0} orders • Track & returns`} onPress={() => router.push("/orders" as any)} />
            <View style={styles.menuDivider} />
            <MenuRow icon="heart-outline" label="Wishlist" sub={`${wishlistIds?.size ?? 0} saved`} onPress={() => router.push("/(tabs)/wishlist" as any)} />
            <View style={styles.menuDivider} />
            <MenuRow icon="location-outline" label="Addresses" sub="Manage shipping addresses" onPress={() => router.push("/addresses" as any)} />
            <View style={styles.menuDivider} />
            <MenuRow icon="notifications-outline" label="Notifications" sub="Order updates & offers" onPress={() => router.push("/notifications" as any)} />
            {isAdmin ? (
              <>
                <View style={styles.menuDivider} />
                <MenuRow icon="settings-outline" label="Admin dashboard" sub="Manage boutique" onPress={() => router.push("/admin" as any)} />
              </>
            ) : null}
          </View>
        </View>

        {/* Membership — slim */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membership</Text>
            <Text style={styles.sectionHint}>1 pt per $1</Text>
          </View>
          <LoyaltyCard account={loyalty ?? null} isLoading={loyaltyLoading} />
          <RewardsList currentPoints={loyalty?.points ?? 0} />
        </View>

        {/* Recent activity — subtle list, not card-heavy */}
        {tx && tx.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <Text style={styles.sectionHint}>{tx.length} events</Text>
            </View>
            <View style={styles.activityList}>
              {tx.slice(0, 3).map((t) => (
                <View key={t.id} style={styles.activityRow}>
                  <Text style={styles.activityType} numberOfLines={1}>{t.type.replace("_", " ")}</Text>
                  <Text style={styles.activityPointsSub} numberOfLines={1}>{t.description ?? ""}</Text>
                  <Text style={[styles.activityPoints, { color: t.points >= 0 ? colors.success : colors.error }]}>{t.points >= 0 ? `+${t.points}` : `${t.points}`}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Exclusive — only gold/platinum, editorial */}
        {(loyalty?.tier === "gold" || loyalty?.tier === "platinum") && exclusive?.data?.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exclusive for {loyalty.tier}</Text>
              <Pressable onPress={() => router.push("/(tabs)/shop" as any)} hitSlop={8}>
                <Text style={styles.seeAll}>Shop all</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionHint}>Elegant curation, reserved for you</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
              {exclusive.data.slice(0, 2).map((p) => (
                <View key={p.id} style={{ flex: 1 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Dev switcher — muted */}
        {__DEV__ ? <DevAccountSwitcher /> : null}

        {/* Footer — clean sign out */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => logout.mutate(undefined, { onSuccess: () => router.replace("/auth/login") })}
            disabled={logout.isPending}
            style={({ pressed }) => [styles.signOutPill, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={14} color={colors.muted} />
            <Text style={styles.signOutText}>{logout.isPending ? "Signing out..." : "Sign out"}</Text>
          </Pressable>
          <Text style={styles.footerHint}>LUNE — FW 2026 • Editorial boutique</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 32,
    gap: 28,
    backgroundColor: colors.background,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  wordmark: { fontSize: 13, letterSpacing: 2.08, fontWeight: "800", color: colors.foreground },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.clay },
  season: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, color: colors.muted },
  bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  identity: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.foreground, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "800", letterSpacing: 0.8, color: colors.paper },
  name: { fontSize: 18, fontWeight: "700", color: colors.foreground, letterSpacing: -0.3 },
  email: { fontSize: 12, color: colors.muted, lineHeight: 16 },
  memberSince: { fontSize: 11, color: colors.mutedLight, marginTop: 1 },
  tierBadge: { paddingHorizontal: 10, height: 26, borderRadius: 999, backgroundColor: colors.foreground, alignItems: "center", justifyContent: "center" },
  tierBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "capitalize", color: colors.surface },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 16, fontWeight: "800", color: colors.foreground, letterSpacing: -0.2 },
  statLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: colors.muted },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", color: colors.foreground },
  sectionHint: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  seeAll: { fontSize: 11, fontWeight: "700", color: colors.clayDeep, textDecorationLine: "underline" },
  menuCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: "hidden" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, height: 54, backgroundColor: colors.surface },
  menuIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  menuSub: { fontSize: 11, color: colors.muted },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 60 },
  activityList: { gap: 8 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  activityType: { fontSize: 11, fontWeight: "700", color: colors.foreground, textTransform: "capitalize", minWidth: 56 },
  activityPointsSub: { flex: 1, fontSize: 11, color: colors.mutedLight },
  activityPoints: { fontSize: 11, fontWeight: "800" },
  footer: { alignItems: "center", gap: 12, paddingTop: 4 },
  signOutPill: { flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 16, height: 36, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  signOutText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: colors.muted },
  footerHint: { fontSize: 10, color: colors.mutedLight, letterSpacing: 0.3 },
  unauthContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 32, gap: 24, justifyContent: "center", backgroundColor: colors.background },
  unauthHeader: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" },
  unauthHero: { alignItems: "center", gap: 10, paddingVertical: 8 },
  unauthIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  unauthTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground, letterSpacing: -0.3, textAlign: "center" },
  unauthDesc: { fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 18, paddingHorizontal: 12 },
  browseLink: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  browseText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: colors.muted },
});
