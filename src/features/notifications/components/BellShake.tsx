import { useEffect } from "react";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type BellShakeProps = {
  // While true, the bell wiggles once every 3s. Rests when false.
  active: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// A gentle repeating wiggle for the notification bell while unread items
// exist: one wiggle (~380ms), then stillness until the next 3s tick.
// Rests completely under Reduce Motion or when there is nothing unread.
export function BellShake({ active, children, style }: BellShakeProps) {
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    const wiggle = () => {
      rotation.value = withSequence(
        withTiming(-14, { duration: 70 }),
        withTiming(12, { duration: 90 }),
        withTiming(-8, { duration: 80 }),
        withTiming(5, { duration: 70 }),
        withTiming(0, { duration: 70 }),
      );
    };
    wiggle();
    const id = setInterval(wiggle, 3000);
    return () => {
      clearInterval(id);
      cancelAnimation(rotation);
      rotation.value = 0;
    };
  }, [active, reducedMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}
