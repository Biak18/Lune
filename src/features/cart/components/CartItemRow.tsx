import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { QuantityStepper } from "./QuantityStepper";
import type { CartItem } from "../services/cartService";
import { resolveUnitPrice } from "../utils/cartTotals";

type Props = {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  updating?: boolean;
};

export function CartItemRow({ item, onUpdateQuantity, onRemove, updating }: Props) {
  const variant = item.variant;
  const product = variant.product;
  const primary = product?.images?.find((i) => i.is_primary) ?? product?.images?.[0];
  const unitPrice = resolveUnitPrice(item);
  const lineTotal = unitPrice * item.quantity;
  const max = variant.stock_quantity ?? 999;
  const isLow = max > 0 && max <= 3 && item.quantity >= max;
  const isOut = max <= 0;

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: primary?.image_url ?? "https://picsum.photos/300/400" }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product?.name ?? "Product"}
        </Text>
        <Text style={styles.variant}>
          {variant.color ?? ""} {variant.color && variant.size ? "·" : ""} {variant.size ?? ""} • SKU {variant.sku}
        </Text>
        <Text style={styles.price}>${unitPrice.toFixed(0)} × {item.quantity} = ${lineTotal.toFixed(0)}</Text>
        {isLow && <Text style={styles.low}>Only {max} in stock</Text>}
        {isOut && <Text style={styles.oos}>Out of stock</Text>}
        <View style={styles.actions}>
          <QuantityStepper
            quantity={item.quantity}
            max={max}
            disabled={!!updating}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          />
          <Pressable onPress={() => onRemove(item.id)} hitSlop={6} style={styles.remove} accessibilityRole="button" accessibilityLabel="Remove item">
            <Ionicons name="trash-outline" size={14} color={colors.muted} />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 86,
    height: 108,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
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
  price: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.foreground,
  },
  low: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.warning,
  },
  oos: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.error,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  remove: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  removeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
  },
});
