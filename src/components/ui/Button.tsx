import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { PressableScale } from "./PressableScale";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const [pressed, setPressed] = useState(false);
  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && !isDisabled && variant === "primary" && styles.primaryPressed,
        pressed && !isDisabled && variant === "secondary" && styles.secondaryPressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <BagRunner variant={variant} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.textPrimary,
            variant === "secondary" && styles.textSecondary,
            variant === "ghost" && styles.textGhost,
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </PressableScale>
  );
}

// Loading state: a bag glides start-to-end across the button — your order is on
// its way. With Reduce Motion on, it rests as a calm, static bag instead.
const TRAVEL_MS = 900;

function BagRunner({ variant }: { variant: Variant }) {
  const [width, setWidth] = useState(0);
  const t = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    t.set(
      withRepeat(
        withTiming(1, {
          duration: TRAVEL_MS,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        false
      )
    );
    return () => {
      cancelAnimation(t);
    };
  }, [reducedMotion, t]);

  const amplitude = Math.max(0, width / 2 - 26);
  const animated = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { transform: [{ translateX: 0 }], opacity: 1 };
    }
    return {
      transform: [{ translateX: (t.value * 2 - 1) * amplitude }],
      opacity: interpolate(t.value, [0, 0.12, 0.88, 1], [0, 1, 1, 0]),
    };
  });

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.runnerSlot}
    >
      <Animated.View style={animated}>
        <Ionicons
          name="cart-outline"
          size={18}
          color={variant === "primary" ? colors.primaryForeground : colors.foreground}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "transparent",
    // Standard boxShadow per request (replaces shadow* + elevation)
    boxShadow: "0 6px 12px rgba(42, 27, 22, 0.12)",
  } as unknown as ViewStyle,
  primary: {
    backgroundColor: colors.primary, // ink
  },
  primaryPressed: {
    backgroundColor: colors.clay,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border, // line
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
  } as unknown as ViewStyle,
  disabled: {
    opacity: 0.45,
    boxShadow: "none",
  } as unknown as ViewStyle,
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1, // 0.11em
    textTransform: "uppercase",
  },
  textPrimary: {
    color: colors.primaryForeground, // paper
  },
  textSecondary: {
    color: colors.foreground,
  },
  textGhost: {
    color: colors.foreground,
  },
  textDisabled: {},
  runnerSlot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  } as unknown as ViewStyle,
});
