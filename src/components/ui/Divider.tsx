import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";

export function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    fontSize: 11,
    color: colors.muted,
  },
});
