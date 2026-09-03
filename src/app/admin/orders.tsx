import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { OrderStatusControl } from "@/features/orders/components/OrderStatusControl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
                <View style={styles.cardInfo}>
                  <Text style={styles.id} numberOfLines={1}>
                    #{item.id.slice(0, 8).toUpperCase()} • $
                    {Number(item.total).toFixed(2)}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {new Date(item.created_at).toLocaleString()} •{" "}
                    {item.user_id.slice(0, 8)}…
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/orders/${item.id}` as any)}
                  >
                    <Text style={styles.link}>View order</Text>
                  </Pressable>
                </View>

                <View style={styles.cardControls}>
                  <Text style={styles.label}>
                    Status: {item.status.replace(/_/g, " ")}
                  </Text>
                  <OrderStatusControl
                    currentStatus={item.status}
                    onStatusChange={(nextStatus) =>
                      update.mutate({ id: item.id, status: nextStatus })
                    }
                    disabled={update.isPending}
                  />
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

  // Card is stacked: info on top, full-width status control below.
  // A side-by-side row layout was tried and dropped — it left too little
  // width for OrderStatusControl's two pill buttons on typical phone
  // screens (~360-400dp), causing label wrap/clip.
  card: {
    flexDirection: "column",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfo: {
    gap: 4,
  },
  cardControls: {
    gap: 6,
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
});
