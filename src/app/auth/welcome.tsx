import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/design/colors";
import { AuthArt } from "@/features/auth/components/AuthArt";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthTopBar } from "@/features/auth/components/AuthTopBar";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <>
      <AuthTopBar />
      <Screen>
        <AuthArt />

        <AuthHeader
          eyebrow="A little more you"
          title="Welcome to Muse."
          subtitle="Save your favorites, keep your bag in sync, and make every entrance feel effortless."
        />

        <View style={styles.form}>
          <Button title="Sign in" onPress={() => router.push("/auth/login")} />
          <Button title="Create an account" variant="secondary" onPress={() => router.push("/auth/register")} />
        </View>

        <View style={styles.browse}>
          <Pressable onPress={() => router.replace("/(tabs)/shop" as any)} accessibilityRole="button" accessibilityLabel="Browse the shop as guest">
            <Text style={styles.browseText}>
              Continue as guest <Text style={styles.browseArrow}>↗</Text>
            </Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 28,
    gap: 14,
  },
  browse: {
    marginTop: 20,
    alignItems: "center",
  },
  browseText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.clayDeep,
  },
  browseArrow: { fontSize: 12, fontWeight: "800" },
});
