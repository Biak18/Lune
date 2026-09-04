import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useOrderQuery } from "@/features/orders/hooks/useOrders";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { OrderItemsList } from "@/features/orders/components/OrderItemsList";
import { DeliveryInfo } from "@/features/orders/components/DeliveryInfo";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { data: order, isLoading, isError, error, refetch } = useOrderQuery(orderId ?? "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.foreground} />
        <Text style={styles.desc}>Loading order…</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>We couldn&apos;t load this order.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title="Retry" onPress={() => refetch()} style={{ marginTop: 12 }} />
        <Pressable onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Order not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const items = (order as any).items ?? [];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
          <Text style={styles.backText}>← Back to orders</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.heading}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.sub}>{new Date(order.created_at).toLocaleString()} • Status: {order.status.replace(/_/g, " ")}</Text>
        </View>

        <OrderTimeline status={order.status} createdAt={order.created_at} />

        <View style={styles.totalsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${Number(order.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shipping</Text>
            <Text style={styles.value}>{Number(order.shipping_amount) === 0 ? "Free" : `$${Number(order.shipping_amount).toFixed(2)}`}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${Number(order.total).toFixed(2)}</Text>
          </View>
        </View>

        <OrderItemsList items={items} />

        <DeliveryInfo shippingAddress={order.shipping_address as any} createdAt={order.created_at} />
      </ScrollView>
    </SafeAreaView>
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
    marginTop: 8,
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
  header: {
    gap: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
  },
  totalsCard: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    color: colors.muted,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.foreground,
  },
});
