import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { Button } from "@/components/ui/Button";

type Props = {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  discount?: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
};

export function CartSummary({ subtotal, shipping, total, itemCount, isFreeShipping, freeShippingThreshold, discount = 0, onCheckout, checkoutDisabled }: Props) {
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  return (
    <View style={styles.wrap}>
      {!isFreeShipping && subtotal > 0 && (
        <Text style={styles.freeHint}>Add ${remaining.toFixed(0)} more for free shipping</Text>
      )}
      {isFreeShipping && subtotal > 0 && <Text style={styles.freeOk}>You have free shipping ✓</Text>}
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</Text>
        <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={[styles.value, isFreeShipping && styles.freeValue]}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</Text>
      </View>
      {discount > 0 ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.success }]}>Rewards discount</Text>
          <Text style={[styles.value, { color: colors.success }]}>- ${discount.toFixed(2)}</Text>
        </View>
      ) : null}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
      {onCheckout && <Button title="Proceed to checkout" disabled={!!checkoutDisabled} onPress={onCheckout} style={{ marginTop: 8 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freeHint: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.warning,
    textAlign: "center",
  },
  freeOk: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  freeValue: {
    color: colors.success,
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
