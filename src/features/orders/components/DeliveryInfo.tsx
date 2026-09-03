import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";

type Props = {
  shippingAddress: Record<string, any> | null;
  createdAt?: string;
};

function formatAddress(addr: Record<string, any> | null) {
  if (!addr) return "No address";
  const parts = [
    addr.recipient_name,
    addr.address_line_1,
    addr.address_line_2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.postal_code,
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");
  return parts;
}

function estimateDelivery(createdAt?: string) {
  if (!createdAt) return "5–7 business days";
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString();
}

export function DeliveryInfo({ shippingAddress, createdAt }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Delivery</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Shipping address</Text>
        <Text style={styles.value}>{formatAddress(shippingAddress)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.block}>
        <Text style={styles.label}>Estimated delivery</Text>
        <Text style={styles.value}>{estimateDelivery(createdAt)}</Text>
        <Text style={styles.hint}>Tracking updates will appear here when shipped.</Text>
      </View>
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
  block: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    color: colors.foreground,
    lineHeight: 18,
  },
  hint: {
    fontSize: 11,
    color: colors.mutedLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
