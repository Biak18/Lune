import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/design/colors";
import type { Variant } from "../types";
import { isSizeAvailable } from "../utils/variant";

type Props = {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  variants: Variant[];
  selectedColor: string | null;
};

export function SizeSelector({ sizes, selectedSize, onSelect, variants, selectedColor }: Props) {
  if (sizes.length === 0) return null;
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      <Text style={styles.label}>
        Size{selectedSize ? ` — ${selectedSize}` : ""}
      </Text>
      <View style={styles.row}>
        {sizes.map((s) => {
          const active = selectedSize === s;
          const disabled = !isSizeAvailable(variants, s, selectedColor);
          return (
            <Pressable
              key={s}
              onPress={async () => {
                if (disabled) return;
                try {
                  await Haptics.selectionAsync();
                } catch {}
                onSelect(s);
              }}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled }}
              accessibilityLabel={`Size ${s}${disabled ? " unavailable" : ""}${active ? " selected" : ""}`}
              hitSlop={4}
              style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selectedColor ? (
        <Text style={styles.hint}>Showing availability for {selectedColor}</Text>
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
    minWidth: 44,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
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
