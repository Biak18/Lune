import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import * as Haptics from "expo-haptics";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export default function AdminOrdersScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "orders-list"],
    queryFn: () => adminService.getAllOrders(),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminService.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders-list"] }),
  });

  return (
    <AdminGuard>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Admin</Text>
          </Pressable>
          <Text style={styles.heading}>Orders</Text>
          <Text style={styles.sub}>Admin can update status via RLS is_admin()</Text>
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
            keyExtractor={(o: any) => o.id}
            contentContainerStyle={{ padding: spacing.xl, gap: 10, paddingBottom: 32 }}
            renderItem={({ item }: any) => (
              <View style={styles.card}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.id}>#{item.id.slice(0, 8).toUpperCase()} • ${Number(item.total).toFixed(2)}</Text>
                  <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()} • {item.user_id.slice(0, 8)}…</Text>
                  <Pressable onPress={() => router.push(`/orders/${item.id}` as any)}>
                    <Text style={styles.link}>View order</Text>
                  </Pressable>
                </View>
                <View style={{ minWidth: 140, gap: 6 }}>
                  <Text style={styles.label}>Status: {item.status}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {STATUSES.map((s) => {
                      const active = s === item.status;
                      return (
                        <Pressable
                          key={s}
                          onPress={async () => {
                            if (active) return;
                            try {
                              await Haptics.selectionAsync();
                            } catch {}
                            update.mutate({ id: item.id, status: s });
                          }}
                          style={[styles.statusChip, active && styles.statusChipActive]}
                        >
                          <Text style={[styles.statusText, active && styles.statusTextActive]}>{s}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}
          />
        )}
      </View>
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
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  id: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.foreground,
  },
  meta: {
    fontSize: 11,
    color: colors.muted,
  },
  link: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  statusChip: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statusChipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.foreground,
    textTransform: "uppercase",
  },
  statusTextActive: {
    color: colors.surface,
  },
});
