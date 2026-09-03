import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";

type Props = {
  value: number; // 0-5, may be fractional for avg
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

export function RatingStars({ value, size = 16, interactive, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const icon: any = filled ? "star" : "star-outline";
        const color = filled ? colors.gold : colors.borderStrong;
        if (!interactive) {
          return <Ionicons key={s} name={icon} size={size} color={color} />;
        }
        return (
          <Pressable
            key={s}
            onPress={() => onChange?.(s)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${s} star${s > 1 ? "s" : ""}`}
            accessibilityState={{ selected: s === Math.round(value) }}
          >
            <Ionicons name={icon} size={size} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
});
