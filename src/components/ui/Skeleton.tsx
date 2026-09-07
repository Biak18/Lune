import { colors } from "@/design/colors";
import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
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

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
  },
});
