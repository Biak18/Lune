import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";

export default function AdminInventoryScreen() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: () => adminService.getLowStock(),
  });

  return (
    <AdminGuard>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
            <Text style={styles.backText}>← Admin</Text>
          </Pressable>
          <Text style={styles.heading}>Inventory</Text>
          <Text style={styles.sub}>Low stock ≤3 — {data?.length ?? 0} variants</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.desc}>{String((error as Error)?.message ?? "Failed")}</Text>
            <Pressable onPress={() => refetch()} style={styles.retry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(v: any) => v.id}
            contentContainerStyle={{ padding: spacing.xl, gap: 8, paddingBottom: 32 }}
            renderItem={({ item }: any) => (
              <View style={[styles.card, item.stock_quantity === 0 && styles.oosCard]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{(item.product as any)?.name ?? item.sku}</Text>
                  <Text style={styles.meta}>{item.sku} • {item.color ?? "?"} / {item.size ?? "?"}</Text>
                </View>
                <View style={[styles.badge, item.stock_quantity === 0 ? styles.oosBadge : styles.lowBadge]}>
                  <Text style={[styles.badgeText, item.stock_quantity === 0 && { color: colors.error }]}>{item.stock_quantity} left</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.desc}>No low stock — all variants well stocked.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.foreground,
    marginTop: 4,
  },
  sub: {
    fontSize: 11,
    color: colors.muted,
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  retry: {
    marginTop: 8,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.surface,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  oosCard: {
    borderColor: colors.error,
    backgroundColor: colors.errorBackground,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  meta: {
    fontSize: 11,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  lowBadge: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  oosBadge: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.warning,
  },
});
