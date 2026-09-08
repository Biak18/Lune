import { useFocusEffect } from "expo-router";
import { useCallback, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

type Props = {
  /** Stagger position within the screen (0, 1, 2 ...). */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const DURATION = 380;
const STAGGER = 45;
const RISE = 10;

/**
 * Entrance reveal for tab screens: plays on first focus and replays on every
 * re-focus, so a tab switch always has a visible beat. Sections further down
 * the screen start slightly later via `index`. Honors the OS Reduce Motion
 * setting by snapping straight to the resting state.
 */
export function Reveal({ index = 0, style, children }: Props) {
  const progress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      progress.set(0);
      progress.set(
        withDelay(
          index * STAGGER,
          withTiming(1, {
            duration: DURATION,
            easing: Easing.out(Easing.cubic),
            reduceMotion: ReduceMotion.System,
          })
        )
      );
      return () => {
        cancelAnimation(progress);
      };
    }, [index, progress])
  );

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * RISE }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
