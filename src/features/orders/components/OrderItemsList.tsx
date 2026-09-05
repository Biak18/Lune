import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import type { OrderItem } from "../services/orderService";

type Props = {
  items: OrderItem[];
};

export function OrderItemsList({ items }: Props) {
  if (!items.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Items {items.length}</Text>
      {items.map((it) => (
        <View key={it.id} style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name} numberOfLines={1}>
              {it.product_name}
            </Text>
            {it.variant_description ? <Text style={styles.variant}>{it.variant_description}</Text> : null}
            <Text style={styles.qty}>×{it.quantity} ${Number(it.unit_price).toFixed(0)} each</Text>
          </View>
          <Text style={styles.total}>${(Number(it.unit_price) * it.quantity).toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  title: {
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
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },
  variant: {
    fontSize: 11,
    color: colors.muted,
  },
  qty: {
    fontSize: 11,
    color: colors.muted,
  },
  total: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
});
