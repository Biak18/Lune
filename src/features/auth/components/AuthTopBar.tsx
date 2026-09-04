import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "@/design/colors";

type Props = {
  onBrowse?: () => void;
};

export function AuthTopBar({ onBrowse }: Props) {
  const handleWordmark = () => router.replace("/");
  const handleBrowse = () => {
    if (onBrowse) onBrowse();
    else router.replace("/");
  };

  return (
    <View style={styles.topbar}>
      <Pressable onPress={handleWordmark} accessibilityRole="button" accessibilityLabel="Browse without signing in">
        <Text style={styles.wordmark}>LUNE</Text>
      </Pressable>
      <Pressable onPress={handleBrowse} accessibilityRole="button" accessibilityLabel="Browse shop">
        <Text style={styles.browse}>Browse shop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 72,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  wordmark: {
    fontSize: 13,
    letterSpacing: 2.08, // 0.16em
    fontWeight: "800",
    color: colors.foreground,
  },
  slash: {
    color: colors.clay,
  },
  browse: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.96, // 0.08em
    textTransform: "uppercase",
    color: colors.foreground,
  },
});
