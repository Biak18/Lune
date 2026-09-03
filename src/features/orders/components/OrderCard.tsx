import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import type { Order } from "../services/orderService";
import { Ionicons } from "@expo/vector-icons";

const statusColor: Record<string, string> = {
  pending: colors.muted,
  confirmed: colors.clay,
  processing: colors.warning,
  shipped: colors.clayDeep,
  out_for_delivery: colors.foreground,
  delivered: colors.success,
  cancelled: colors.error,
};

type Props = {
  order: Order;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const d = new Date(order.created_at).toLocaleDateString();
  const color = statusColor[order.status] ?? colors.muted;
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button" accessibilityLabel={`Order ${order.id.slice(0, 8)}`}>
      <View style={styles.top}>
        <View>
          <Text style={styles.id}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.date}>{d} • ${Number(order.total).toFixed(2)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + "18", borderColor: color + "30" }]}>
          <Text style={[styles.badgeText, { color }]}>{order.status.replace(/_/g, " ")}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.bottom}>
        <Text style={styles.total}>Total ${Number(order.total).toFixed(2)}</Text>
        <View style={styles.viewRow}>
          <Text style={styles.viewText}>View details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.muted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  id: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: colors.foreground,
  },
  date: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
  },
});
