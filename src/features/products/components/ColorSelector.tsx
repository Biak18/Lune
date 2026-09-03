import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import type { Variant } from "../types";
import { isColorAvailable } from "../utils/variant";

type Props = {
  colorsList: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
  variants: Variant[];
  selectedSize: string | null;
};

export function ColorSelector({ colorsList, selectedColor, onSelect, variants, selectedSize }: Props) {
  if (colorsList.length === 0) return null;
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      <Text style={styles.label}>
        Color{selectedColor ? ` — ${selectedColor}` : ""}
      </Text>
      <View style={styles.row}>
        {colorsList.map((c) => {
          const active = selectedColor === c;
          const disabled = !isColorAvailable(variants, c, selectedSize);
          return (
            <Pressable
              key={c}
              onPress={() => !disabled && onSelect(c)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled }}
              accessibilityLabel={`Color ${c}${disabled ? " unavailable" : ""}${active ? " selected" : ""}`}
              hitSlop={4}
              style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selectedSize ? (
        <Text style={styles.hint}>Showing availability for size {selectedSize}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipDisabled: {
    opacity: 0.38,
    backgroundColor: colors.surfaceMuted,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.surface,
  },
  chipTextDisabled: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
  },
});
