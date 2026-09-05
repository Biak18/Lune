import { colors } from "@/design/colors";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const DEFAULT_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;
export type OrderFlowStatus = (typeof DEFAULT_FLOW)[number] | string;

type Props = {
  currentStatus: string;
  onStatusChange: (nextStatus: string) => void;
  flow?: readonly string[];
  disabled?: boolean;
  style?: ViewStyle;
};

const REVEAL_DURATION = 380;
const REVEAL_GAP = 12;

function getPrevNext(current: string, flow: readonly string[]) {
  if (current === "cancelled")
    return { prev: null, next: null, isTerminal: true };
  // Legacy DB value out_for_delivery treat as shipped step for 5-step flow
  if (current === "out_for_delivery")
    return { prev: "shipped", next: "delivered", isTerminal: false };
  const idx = flow.indexOf(current);
  if (idx === -1)
    return { prev: null, next: flow[0] ?? null, isTerminal: false };
  return {
    prev: idx > 0 ? flow[idx - 1] : null,
    next: idx < flow.length - 1 ? flow[idx + 1] : null,
    isTerminal: idx === flow.length - 1,
  };
}

/**
 * Drives the rollback button's reveal. Animates `flexGrow` (0 1) rather
 * than a pixel width, since the button shares row space with the next-status
 * button via flexbox rather than having an intrinsic size. `marginRight`
 * grows in lockstep so spacing doesn't pop in ahead of the button.
 * Runs once per mount the parent remounts this via a `key` change whenever
 * `currentStatus` changes, so it naturally replays on every transition.
 */
function useRevealProgress(reduced: boolean) {
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(1, {
      duration: REVEAL_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    // Mount-only: this component instance is recreated (via `key`) on every
    // status change, so there is intentionally no dependency array beyond [].
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return progress;
}

function RollbackButton({
  prev,
  disabled,
  onPress,
  reduced,
}: {
  prev: string;
  disabled?: boolean;
  onPress: () => void;
  reduced: boolean;
}) {
  const progress = useRevealProgress(reduced);

  // No `opacity` here: this node also carries `exiting={FadeOut...}`, which
  // animates opacity on unmount. Driving opacity from both a useAnimatedStyle
  // and a layout animation on the same node races on every frame that's
  // what the "Property may be overwritten by a layout animation" warning is
  // about. flexGrow/marginRight are untouched by FadeOut, so those are safe
  // to keep here. The button is already effectively invisible at
  // flexGrow: 0 + overflow: hidden, so no separate fade-in is needed.
  const animatedStyle = useAnimatedStyle(() => ({
    flexGrow: progress.value,
    flexBasis: 0,
    marginRight: progress.value * REVEAL_GAP,
  }));

  return (
    <Animated.View
      style={[styles.rollbackAnimated, animatedStyle]}
      exiting={FadeOut.duration(180)}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Rollback to ${prev}`}
        style={({ pressed }) => [
          styles.prevBtn,
          pressed && !disabled && styles.prevPressed,
        ]}
      >
        <Text style={styles.prevText} numberOfLines={1}>
          {prev}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function OrderStatusControl({
  currentStatus,
  onStatusChange,
  flow = DEFAULT_FLOW,
  disabled,
  style,
}: Props) {
  const { prev, next, isTerminal } = getPrevNext(currentStatus, flow);
  const reduced = useReducedMotion();
  const isSingle =
    !prev || !next || isTerminal || currentStatus === "cancelled";

  const handlePrev = async () => {
    if (!prev || disabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
    onStatusChange(prev);
  };

  const handleNext = async () => {
    if (!next || disabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onStatusChange(next);
  };

  const nextEntering = reduced
    ? FadeIn.duration(180)
    : FadeIn.duration(260).easing(Easing.out(Easing.cubic));

  if (isSingle) {
    // Pending single next full-width; Delivered/Cancelled single completed
    const isCompleted = isTerminal || currentStatus === "cancelled";
    const label = isCompleted
      ? `${currentStatus} `
      : next
        ? `${next}`
        : currentStatus;
    const onPress = isCompleted ? undefined : handleNext;
    const isDisabled = disabled || isCompleted || !next;

    return (
      <View
        style={[styles.container, styles.singleContainer, style]}
        accessibilityRole="toolbar"
      >
        <Animated.View
          key={`single-${currentStatus}`}
          entering={nextEntering}
          exiting={FadeOut.duration(180)}
          style={styles.singleWrap}
        >
          <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={
              isCompleted ? `Status ${currentStatus}` : `Move to ${next}`
            }
            accessibilityState={{ disabled: isDisabled }}
            style={({ pressed }) => [
              styles.singleBtn,
              isCompleted && styles.singleCompleted,
              isDisabled && styles.singleDisabled,
              pressed && !isDisabled && styles.singlePressed,
            ]}
          >
            <Animated.Text
              key={`single-text-${currentStatus}`}
              entering={nextEntering}
              style={[
                styles.singleText,
                isCompleted && styles.singleTextCompleted,
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // Middle: both prev (secondary, grows in) and next (primary)
  return (
    <View style={[styles.container, style]} accessibilityRole="toolbar">
      <RollbackButton
        key={`prev-${currentStatus}`}
        prev={prev}
        disabled={disabled}
        onPress={handlePrev}
        reduced={reduced}
      />

      <Animated.View
        key={`next-${currentStatus}`}
        entering={nextEntering}
        exiting={FadeOut.duration(180)}
        style={styles.nextWrap}
      >
        <Pressable
          onPress={handleNext}
          disabled={disabled || !next}
          accessibilityRole="button"
          accessibilityLabel={next ? `Move to ${next}` : "No next status"}
          accessibilityState={{ disabled: !next || !!disabled }}
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && !disabled && styles.nextPressed,
            (!next || disabled) && styles.nextDisabled,
          ]}
        >
          <Animated.Text
            key={`next-text-${currentStatus}`}
            entering={nextEntering}
            style={styles.nextText}
          >
            {next}
          </Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // No `gap` here on purpose: RollbackButton animates its own marginRight
    // in step with its flexGrow, so spacing grows in with the button rather
    // than being reserved up front.
    overflow: "hidden",
  },
  singleContainer: {
    justifyContent: "center",
  },
  singleWrap: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  singleBtn: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  singlePressed: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  singleDisabled: {
    opacity: 0.6,
  },
  singleCompleted: {
    backgroundColor: colors.successBackground,
    borderColor: colors.success,
  },
  singleText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.surface,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  singleTextCompleted: {
    color: colors.success,
  },
  rollbackAnimated: {
    overflow: "hidden",
  },
  prevBtn: {
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  prevPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  prevText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
    textTransform: "capitalize",
  },
  nextWrap: {
    flex: 1,
  },
  nextBtn: {
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  nextPressed: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  nextDisabled: {
    opacity: 0.5,
  },
  nextText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.surface,
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
});
