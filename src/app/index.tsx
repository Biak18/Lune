import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/colors";

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={styles.loadingText}>Loading boutique...</Text>
      </View>
    );
  }

  // Catalog is public (ROADMAP Phase 3) everyone lands on Home tab;
  // auth is handled via Profile tab / auth screens.
  return <Redirect href={"/home" as any} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 14,
    color: colors.muted,
  },
});
