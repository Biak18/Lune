import { colors } from "@/design/colors";
import { fontFamily } from "@/design/typography";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LottieAnimation } from "./LottieAnimation";
import { Screen } from "./Screen";

const DRESS_SKETCH = require("@/assets/lottie/dress-sketch.json") as number;
// Point this at the exact same file your app.json "icon" field already
// references -- it's the app icon, not a separate asset to maintain, so this
// path should match wherever that one lives rather than duplicating it.
const BRAND_ICON = require("@/assets/images/icon.png");

type Props = {
  message?: string;
  /** Ms to wait before showing anything — avoids a flash on fast loads. */
  delay?: number;
};

/**
 * Boutique full-screen loading state: the dress-sketch medallion (the look
 * being "drawn") with a small crescent-moon badge referencing the LUNE mark,
 * wordmark, and a staggered pulse row signaling active progress. Replaces
 * bare ActivityIndicator early returns so every loading screen matches the
 * atelier identity.
 */
export function LoadingState({ message, delay = 250 }: Props) {
  const [visible, setVisible] = useState(delay <= 0);
  const reducedMotion = useReducedMotion();

  const glow = useSharedValue(reducedMotion ? 0.16 : 0.1);
  const wordmarkBreath = useSharedValue(1);

  useEffect(() => {
    if (delay <= 0) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (reducedMotion) return;
    glow.value = withRepeat(
      withTiming(0.22, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    wordmarkBreath.value = withRepeat(
      withTiming(0.6, { duration: 1400 }),
      -1,
      true,
    );
  }, [glow, reducedMotion, wordmarkBreath]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkBreath.value,
  }));

  return (
    <Screen centered>
      <View style={styles.inner} accessibilityRole="progressbar">
        {visible ? (
          <>
            <View style={styles.medallionWrap}>
              <Animated.View style={[styles.glow, glowStyle]} />
              <View style={styles.medallion}>
                <LottieAnimation
                  source={DRESS_SKETCH}
                  loop
                  style={styles.art}
                />
              </View>
              <View style={styles.badge}>
                <Image
                  source={BRAND_ICON}
                  style={styles.badgeIcon}
                  contentFit="contain"
                />
              </View>
            </View>

            <Animated.View style={wordmarkStyle}>
              <Text style={styles.wordmark}>LUNE</Text>
            </Animated.View>

            <View style={styles.dots} accessibilityElementsHidden>
              <PulseDot delay={0} reducedMotion={reducedMotion} />
              <PulseDot delay={160} reducedMotion={reducedMotion} />
              <PulseDot delay={320} reducedMotion={reducedMotion} />
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

/**
 * One dot in the loading row. Each instance gets its own phase via `delay`,
 * so the three pulse in a staggered wave rather than in unison -- a plain
 * synchronized blink reads as "stuck," a staggered one reads as "working."
 */
function PulseDot({
  delay: startDelay,
  reducedMotion,
}: {
  delay: number;
  reducedMotion: boolean;
}) {
  const pulse = useSharedValue(reducedMotion ? 0.9 : 0.35);

  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withDelay(
      startDelay,
      withRepeat(
        withTiming(1, { duration: 620, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [pulse, reducedMotion, startDelay]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.7 + pulse.value * 0.3 }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
    minHeight: 260, // reserve space so content doesn't jump when it appears
  },
  medallionWrap: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.clay,
  },
  medallion: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  art: {
    width: 96,
    height: 96,
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    width: 20,
    height: 20,
  },
  wordmark: {
    fontSize: 13,
    letterSpacing: 5,
    fontWeight: "500",
    color: colors.foreground,
    fontFamily: fontFamily.display,
    marginLeft: 5, // optically recenter letterspaced caps
    marginTop: 16,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.clay,
  },
  message: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
  },
});
