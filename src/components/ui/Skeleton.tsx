import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/design/colors";

export function Skeleton({ style }: { style?: ViewStyle }) {
  return <View style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    opacity: 0.9,
  },
});
