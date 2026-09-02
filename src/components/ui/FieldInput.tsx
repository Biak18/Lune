// src/components/ui/FieldInput.tsx
// Canonical TextInput — floating label with reanimated (UI thread), 50h input, 14r, line→clay focus.
// Default `variant="floating"` provides the boutique animation; use `variant="stacked"` for static search-style fields.

import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { forwardRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type FieldInputProps = Omit<TextInputProps, "style"> & {
  label: string;
  value: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  /** Controls label placement. `floating` (default) = animated boutique label. `stacked` = static label above input (e.g. Search). */
  variant?: "stacked" | "floating";
  /** Extra element rendered on same row as label — only for stacked variant */
  labelExtra?: React.ReactNode;
};

export const FieldInput = forwardRef<TextInput, FieldInputProps>(
  function FieldInput(
    {
      label,
      value,
      error,
      hint,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      placeholder,
      leftElement,
      rightElement,
      variant = "floating",
      labelExtra,
      editable = true,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
      if (variant === "floating") {
        progress.value = withTiming(focused || !!value ? 1 : 0, {
          duration: 160,
        });
      }
    }, [focused, value, variant, progress]);

    const hasError = !!error;
    const borderColor = hasError
      ? colors.error
      : focused
        ? colors.clay
        : colors.border;
    const bg = colors.surface;
    const isDisabled = editable === false;

    // Floating styles — reduced for compact boutique feel
    const animatedLabelStyle = useAnimatedStyle(() => ({
      top: 15 + progress.value * -21,
      fontSize: 12 + progress.value * -2,
    }));
    const floatingLabelStyle: TextStyle = {
      position: "absolute",
      left: 12,
      backgroundColor: bg,
      paddingHorizontal: 4,
      zIndex: 1,
      color: hasError ? colors.error : focused ? colors.clay : colors.muted,
      fontWeight: "800",
      letterSpacing: 0.7,
      textTransform: "uppercase",
      fontSize: 10,
    };

    if (variant === "floating") {
      const nativePlaceholder =
        focused && !value && placeholder && placeholder !== label
          ? placeholder
          : undefined;
      return (
        <View style={[{ gap: 7 }, containerStyle]}>
          <View
            style={[
              styles.wrapFloating,
              {
                borderColor,
                borderRadius: radius.lg,
                backgroundColor: isDisabled ? colors.surfaceMuted : bg,
                opacity: isDisabled ? 0.7 : 1,
              },
            ]}
          >
            <Animated.Text
              style={[floatingLabelStyle, animatedLabelStyle]}
              pointerEvents="none"
            >
              {label}
            </Animated.Text>
            {leftElement ? (
              <View style={styles.adornmentLeft}>{leftElement}</View>
            ) : null}
            <TextInput
              ref={ref}
              value={value}
              editable={editable}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              placeholder={nativePlaceholder}
              placeholderTextColor={colors.mutedLight}
              accessibilityLabel={accessibilityLabel ?? label}
              accessibilityState={{ disabled: isDisabled }}
              aria-invalid={hasError}
              style={[
                styles.inputFloating,
                {
                  color: colors.foreground,
                  paddingHorizontal: spacing.lg,
                  fontSize: 13,
                  paddingLeft: leftElement ? 40 : spacing.lg,
                  paddingRight: rightElement ? 44 : spacing.lg,
                },
                inputStyle,
              ]}
              {...rest}
            />
            {rightElement ? (
              <View style={styles.adornmentRight}>{rightElement}</View>
            ) : null}
          </View>
          {!!error ? (
            <Text style={styles.helperError} accessibilityRole="alert">
              {error}
            </Text>
          ) : !!hint ? (
            <Text style={styles.helperHint}>{hint}</Text>
          ) : null}
        </View>
      );
    }

    // stacked — sample fidelity
    return (
      <View style={[{ gap: 7 }, containerStyle]}>
        <View style={styles.labelRow}>
          <Text
            style={[styles.stackedLabel, hasError && { color: colors.error }]}
          >
            {label}
          </Text>
          {labelExtra ? <View>{labelExtra}</View> : null}
        </View>
        <View
          style={[
            styles.inputWrap,
            {
              borderColor,
              backgroundColor: isDisabled ? colors.surfaceMuted : bg,
              opacity: isDisabled ? 0.6 : 1,
            },
          ]}
        >
          {leftElement ? (
            <View style={styles.adornmentLeftStacked}>{leftElement}</View>
          ) : null}
          <TextInput
            ref={ref}
            value={value}
            editable={editable}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedLight}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{ disabled: isDisabled }}
            aria-invalid={hasError}
            style={[
              styles.inputStacked,
              {
                color: colors.foreground,
                paddingLeft: leftElement ? 40 : 14,
                paddingRight: rightElement ? 48 : 14,
              },
              inputStyle,
            ]}
            {...rest}
          />
          {rightElement ? (
            <View style={styles.adornmentRightStacked}>{rightElement}</View>
          ) : null}
        </View>
        {!!error ? (
          <Text style={styles.helperError} accessibilityRole="alert">
            {error}
          </Text>
        ) : !!hint ? (
          <Text style={styles.helperHint}>{hint}</Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  // floating (legacy/boutique)
  wrapFloating: {
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  inputFloating: {
    height: 50,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
  },
  adornmentLeft: {
    position: "absolute",
    left: 10,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  adornmentRight: {
    position: "absolute",
    right: 10,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  // stacked (sample)
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stackedLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  inputWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
  },
  inputStacked: {
    flex: 1,
    height: 50,
    fontSize: 13,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  adornmentLeftStacked: {
    position: "absolute",
    left: 7,
    zIndex: 2,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  adornmentRightStacked: {
    position: "absolute",
    right: 7,
    zIndex: 2,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  helperError: {
    color: colors.error,
    fontSize: 11,
    lineHeight: 14,
  },
  helperHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
  },
});
