import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { LottieAnimation } from "./LottieAnimation";
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
  const reducedMotion = useReducedMotion();
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
        <CartLoader variant={variant} reducedMotion={reducedMotion} />
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

// Loading state: a line-art cart glides start-to-end with a rolling bob and
// fading speed streaks — "your order is on its way". Under Reduce Motion it
// rests as a calm, static cart.
const CART_LOADER = require("@/assets/lottie/cart-glide.json") as number;

function CartLoader({
  variant,
  reducedMotion,
}: {
  variant: Variant;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <Ionicons
        name="cart-outline"
        size={18}
        color={variant === "primary" ? colors.primaryForeground : colors.foreground}
      />
    );
  }
  return (
    <LottieAnimation
      source={CART_LOADER}
      loop
      style={styles.loader}
      colorFilters={
        variant === "primary"
          ? undefined
          : [
              { keypath: "cart.body", color: colors.foreground },
              { keypath: "cart.streak-a", color: colors.foreground },
              { keypath: "cart.streak-b", color: colors.foreground },
            ]
      }
    />
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
  loader: {
    width: 132,
    height: 32,
  },
});
