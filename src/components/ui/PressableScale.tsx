import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 28, stiffness: 420, reduceMotion: ReduceMotion.System };

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Defaults to a subtle 0.97. */
  pressedScale?: number;
};

/**
 * Pressable with a soft spring press feedback. Scales down while the touch is
 * active and springs back on release. Respects the OS reduce-motion setting.
 */
export function PressableScale({
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={(e) => {
        scale.set(withSpring(pressedScale, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
}
