import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";

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
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
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
        <ActivityIndicator
          color={variant === "primary" ? colors.primaryForeground : colors.foreground}
        />
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
    </Pressable>
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
});
