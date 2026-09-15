import { colors } from "@/design/colors";
import { fontFamily } from "@/design/typography";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LottieAnimation } from "./LottieAnimation";

const HANGER_SWAY = require("@/assets/lottie/hanger-sway.json") as number;

// Boutique boot screen: a swaying hanger over the serif wordmark.
// The Lottie layer is native-only (renders nothing on web) — the wordmark
// and breathing pulse carry the composition everywhere.
export function BootSplash() {
  const breath = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    breath.value = withRepeat(withTiming(0.55, { duration: 1400 }), -1, true);
  }, [breath, reducedMotion]);

  const breathingStyle = useAnimatedStyle(() => ({
    opacity: breath.value,
  }));

  return (
    <View style={styles.root} accessibilityRole="progressbar">
      <LottieAnimation source={HANGER_SWAY} loop style={styles.hanger} />
      <Animated.View style={breathingStyle}>
        <Text style={styles.wordmark}>LUNE</Text>
      </Animated.View>
      <View style={styles.seasonRow}>
        <View style={styles.dot} />
        <Text style={styles.season}>Opening the atelier</Text>
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 4,
  },
  hanger: {
    width: 168,
    height: 168,
  },
  wordmark: {
    fontSize: 34,
    letterSpacing: 10,
    fontWeight: "500",
    color: colors.foreground,
    fontFamily: fontFamily.display,
    marginLeft: 10, // optically recenter letterspaced caps
  },
  seasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  season: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: colors.muted,
  },
});
