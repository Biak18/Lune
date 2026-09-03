import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const FLOW = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"] as const;
type FlowStatus = (typeof FLOW)[number];
const ALL_STATUSES = [...FLOW, "cancelled"] as const;

function getPrevNext(current: string) {
  if (current === "cancelled") return { prev: null, next: null };
  const idx = FLOW.indexOf(current as FlowStatus);
  if (idx === -1) return { prev: null, next: FLOW[0] as string };
  return {
    prev: idx > 0 ? FLOW[idx - 1] : null,
    next: idx < FLOW.length - 1 ? FLOW[idx + 1] : null,
  };
}

export default function AdminOrdersScreen() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "orders-list"],
    queryFn: () => adminService.getAllOrders(),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "orders-list"] }),
  });

  return (
    <AdminGuard>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Admin</Text>
          </Pressable>
          <Text style={styles.heading}>Orders</Text>
          <Text style={styles.sub}>
            Admin can update status via RLS is_admin()
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.desc}>
              {String((error as Error)?.message ?? "Failed")}
            </Text>
            <Pressable onPress={() => refetch()} style={styles.retry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(o: any) => o.id}
            contentContainerStyle={{
              padding: spacing.xl,
              gap: 10,
              paddingBottom: 32,
            }}
            renderItem={({ item }: any) => (
              <View style={styles.card}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.id}>
                    #{item.id.slice(0, 8).toUpperCase()} • $
                    {Number(item.total).toFixed(2)}
                  </Text>
                  <Text style={styles.meta}>
                    {new Date(item.created_at).toLocaleString()} •{" "}
                    {item.user_id.slice(0, 8)}…
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/orders/${item.id}` as any)}
                  >
                    <Text style={styles.link}>View order</Text>
                  </Pressable>
                </View>
                <View style={{ minWidth: 160, gap: 6, flex: 1 }}>
                  <Text style={styles.label}>Status: {item.status.replace(/_/g, " ")}</Text>
                  {(() => {
                    const { prev, next } = getPrevNext(item.status);
                    return (
                      <View style={styles.navRow}>
                        <Pressable
                          onPress={async () => {
                            if (!prev) return;
                            try {
                              await Haptics.selectionAsync();
                            } catch {}
                            update.mutate({ id: item.id, status: prev });
                          }}
                          disabled={!prev || update.isPending}
                          style={[styles.navBtn, !prev && styles.navBtnDisabled]}
                          accessibilityRole="button"
                          accessibilityLabel={prev ? `Previous status ${prev}` : "No previous status"}
                        >
                          <Text style={[styles.navText, !prev && styles.navTextDisabled]}>{prev ? `← ${prev}` : "—"}</Text>
                        </Pressable>
                        <Pressable
                          onPress={async () => {
                            if (!next) return;
                            try {
                              await Haptics.selectionAsync();
                            } catch {}
                            update.mutate({ id: item.id, status: next });
                          }}
                          disabled={!next || update.isPending}
                          style={[styles.navBtn, styles.navBtnNext, !next && styles.navBtnDisabled]}
                          accessibilityRole="button"
                          accessibilityLabel={next ? `Next status ${next}` : "No next status"}
                        >
                          <Text style={[styles.navText, styles.navTextNext, !next && styles.navTextDisabled]}>{next ? `${next} →` : "—"}</Text>
                        </Pressable>
                      </View>
                    );
                  })()}
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
    flexDirection: "column",
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
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  navBtn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  navBtnNext: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  navBtnDisabled: {
    opacity: 0.4,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  navText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
    textTransform: "capitalize",
  },
  navTextNext: {
    color: colors.surface,
  },
  navTextDisabled: {
    color: colors.mutedLight,
  },
});
