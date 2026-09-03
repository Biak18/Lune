import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Ionicons } from "@expo/vector-icons";

function StatCard({ label, value, icon, onPress }: { label: string; value: string | number; icon: any; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={colors.foreground} />
      </View>
      <Text style={styles.statValue}>{String(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });

  return (
    <AdminGuard>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.heading}>Admin</Text>
          <Text style={styles.sub}>Secure server-side authorization via is_admin() + RLS</Text>

          {isLoading ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <>
              <View style={styles.grid}>
                <StatCard label="Products" value={stats?.products ?? 0} icon="shirt-outline" onPress={() => router.push("/admin/products" as any)} />
                <StatCard label="Orders" value={stats?.orders ?? 0} icon="receipt-outline" onPress={() => router.push("/admin/orders" as any)} />
                <StatCard label="Low stock" value={stats?.lowStock ?? 0} icon="warning-outline" onPress={() => router.push("/admin/inventory" as any)} />
                <StatCard label="Categories" value={stats?.categories ?? 0} icon="grid-outline" />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manage</Text>
                <View style={{ gap: 10 }}>
                  <Pressable style={styles.row} onPress={() => router.push("/admin/products" as any)}>
                    <Ionicons name="cube-outline" size={18} color={colors.foreground} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>Products & Variants</Text>
                      <Text style={styles.rowDesc}>Toggle active, view SKUs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </Pressable>
                  <Pressable style={styles.row} onPress={() => router.push("/admin/orders" as any)}>
                    <Ionicons name="bag-handle-outline" size={18} color={colors.foreground} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>Orders</Text>
                      <Text style={styles.rowDesc}>Update status (pending→delivered)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </Pressable>
                  <Pressable style={styles.row} onPress={() => router.push("/admin/inventory" as any)}>
                    <Ionicons name="layers-outline" size={18} color={colors.foreground} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>Inventory</Text>
                      <Text style={styles.rowDesc}>Low stock ≤3</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </Pressable>
                </View>
              </View>

              <Pressable onPress={() => refetch()} style={styles.refresh}>
                <Text style={styles.refreshText}>Refresh stats</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    gap: 16,
    paddingBottom: 32,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stat: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    alignItems: "center",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.foreground,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  rowDesc: {
    fontSize: 11,
    color: colors.muted,
  },
  refresh: {
    alignSelf: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
});
