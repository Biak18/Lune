import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export function FormError({ message }: { message?: string | null }) {
  // Buzz once whenever an error appears (e.g. wrong password). Fires on
  // message change only, so re-renders with the same error stay silent.
  useEffect(() => {
    if (!message) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }, [message]);
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
