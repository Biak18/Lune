import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { StyleSheet, Text, View } from "react-native";

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 12,
    padding: spacing.lg,
  },
  text: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
});
