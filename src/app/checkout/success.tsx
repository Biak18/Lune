import { Button } from "@/components/ui/Button";
import { LottieAnimation } from "@/components/ui/LottieAnimation";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { fontFamily } from "@/design/typography";
import { useOrderQuery } from "@/features/orders/hooks/useOrders";
import { formatStatus } from "@/features/orders/utils/formatStatus";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const { data: order, isLoading, isError } = useOrderQuery(orderId ?? "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Order confirmed</Text>
        <Text style={styles.desc}>We are preparing your order…</Text>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.desc}>
          Your order was created. You can find it in your orders.
        </Text>
        <Text style={styles.orderNo}>Order Nº {orderId}</Text>
        <Button title="View orders" onPress={() => router.replace("/orders" as any)} style={{ marginTop: 16 }} />
        <Pressable onPress={() => router.replace("/(tabs)/shop" as any)} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Continue shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const shortId = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.content}>
        <LottieAnimation
          source={require("@/assets/lottie/order-seal.json")}
          style={styles.seal}
        />
        <Text style={styles.eyebrow}>Order Nº {shortId}</Text>
        <Text style={styles.title}>
          Order <Text style={styles.titleAccent}>confirmed</Text>
        </Text>
        <Text style={styles.desc}>
          We&apos;ve started preparing your order. You&apos;ll receive shipping
          updates soon.
        </Text>

        <View style={styles.receipt}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.leader} />
            <Text style={styles.value}>{formatStatus(order.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <View style={styles.leader} />
            <Text style={styles.value}>${Number(order.total).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Items</Text>
            <View style={styles.leader} />
            <Text style={styles.value}>{order.items?.length ?? 0}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="View order" onPress={() => router.replace(`/orders/${order.id}` as any)} />
          <Button
            title="Continue shopping"
            variant="secondary"
            onPress={() => router.replace("/(tabs)/shop" as any)}
          />
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
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  seal: {
    width: 240,
    height: 240,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.clay,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "500",
    letterSpacing: -0.6,
    color: colors.foreground,
    fontFamily: fontFamily.display,
    textAlign: "center",
  },
  titleAccent: {
    fontFamily: fontFamily.displayItalic,
    fontWeight: "400",
    color: colors.clayDeep,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  orderNo: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.foreground,
  },
  receipt: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  leader: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    marginHorizontal: 8,
    marginBottom: 3,
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
  actions: {
    width: "100%",
    gap: 10,
    marginTop: 16,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
});
