import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import type { Variant } from "../types";
import { getStockLabel } from "../utils/variant";

type Props = {
  variant: Variant | null;
  compact?: boolean;
};

export function StockBadge({ variant, compact }: Props) {
  const { text, tone } = getStockLabel(variant);
  return (
    <View style={[styles.badge, tone === "oos" && styles.oosBg, tone === "low" && styles.lowBg, tone === "unavailable" && styles.naBg]}>
      <Text
        style={[
          styles.text,
          tone === "oos" && styles.oosText,
          tone === "low" && styles.lowText,
          tone === "unavailable" && styles.naText,
        ]}
      >
        {text}
        {variant ? ` SKU ${variant.sku}` : ""}
      </Text>
      {!compact && variant && tone !== "oos" && tone !== "unavailable" ? (
        <Text style={styles.sub}>Ready to ship</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    gap: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  sub: {
    fontSize: 11,
    color: colors.mutedLight,
  },
  oosBg: {},
  lowBg: {},
  naBg: {},
  oosText: {
    color: colors.error,
    fontWeight: "700",
  },
  lowText: {
    color: colors.warning,
    fontWeight: "700",
  },
  naText: {
    color: colors.muted,
  },
});
