import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useOrderQuery } from "@/features/orders/hooks/useOrders";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { data: order, isLoading, isError } = useOrderQuery(orderId ?? "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Order confirmed!</Text>
        <Text style={styles.desc}>We are preparing your order…</Text>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.desc}>Your order was created successfully.</Text>
        <Text style={styles.orderId}>{orderId}</Text>
        <Button title="View orders" onPress={() => router.replace("/orders" as any)} style={{ marginTop: 16 }} />
        <Pressable onPress={() => router.replace("/(tabs)/shop" as any)} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Continue shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={28} color={colors.surface} />
        </View>
        <Text style={styles.title}>Order confirmed</Text>
        <Text style={styles.desc}>Your order has been placed. You will receive shipping updates soon.</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Order ID</Text>
          <Text style={styles.orderId}>{order.id}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{order.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>${Number(order.total).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>{order.items?.length ?? 0}</Text>
          </View>
        </View>
        <View style={{ gap: 10, marginTop: 16, width: "100%" }}>
          <Button title="View order" onPress={() => router.replace(`/orders/${order.id}` as any)} />
          <Button title="Continue shopping" variant="secondary" onPress={() => router.replace("/(tabs)/shop" as any)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  card: {
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
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
  summary: {
    width: "100%",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  orderId: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.foreground,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.foreground,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
});
