import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@/design/colors";

type Props = {
  quantity: number;
  max?: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
};

export function QuantityStepper({ quantity, max, onDecrease, onIncrease, disabled }: Props) {
  const decDisabled = disabled || quantity <= 1;
  const incDisabled = disabled || (max != null && quantity >= max);
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={async () => {
          if (decDisabled) return;
          try {
            await Haptics.selectionAsync();
          } catch {}
          onDecrease();
        }}
        disabled={decDisabled}
        hitSlop={6}
        style={[styles.btn, decDisabled && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Ionicons name="remove" size={14} color={decDisabled ? colors.mutedLight : colors.foreground} />
      </Pressable>
      <Text style={styles.qty}>{quantity}</Text>
      <Pressable
        onPress={async () => {
          if (incDisabled) return;
          try {
            await Haptics.selectionAsync();
          } catch {}
          onIncrease();
        }}
        disabled={incDisabled}
        hitSlop={6}
        style={[styles.btn, incDisabled && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Ionicons name="add" size={14} color={incDisabled ? colors.mutedLight : colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  qty: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
    paddingHorizontal: 4,
  },
});
