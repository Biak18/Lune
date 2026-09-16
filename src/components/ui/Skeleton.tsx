import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
    Easing,
    ReduceMotion,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export function Skeleton({ style }: { style?: ViewStyle }) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, {
        duration: 850,
        easing: Easing.inOut(Easing.ease),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.base, animatedStyle, style]} />;
}

/**
 * Standard product-card placeholder: image block + one or two text lines.
 * Matches the 2-column card geometry used by ProductGrid, carousels, and
 * home sections. Pass wrapper sizing (width/flex) via `style`.
 */
export function ProductCardSkeleton({
  lines = 2,
  style,
}: {
  lines?: 1 | 2;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
      <Skeleton style={{ height: 12, width: "70%" }} />
      {lines === 2 ? (
        <Skeleton style={{ height: 12, width: "40%" }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
  },
  card: {
    gap: 8,
  },
});
