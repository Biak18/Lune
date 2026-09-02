import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Link } from "expo-router";

export default function CartScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Your bag</Text>
      <Text style={styles.sub}>Your bag is empty.</Text>
      <Text style={styles.desc}>Add dresses with your size and color — they’ll appear here for checkout.</Text>
      <Link href={"/shop" as any} asChild>
        <Button title="Start shopping" variant="primary" style={{ marginTop: spacing.lg }} />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
  },
  sub: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: 8,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 300,
  },
});
