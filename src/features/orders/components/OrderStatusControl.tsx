import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export const DEFAULT_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
export type OrderFlowStatus = (typeof DEFAULT_FLOW)[number] | string;

type Props = {
  currentStatus: string;
  onStatusChange: (nextStatus: string) => void;
  flow?: readonly string[];
  disabled?: boolean;
  style?: ViewStyle;
};

function getPrevNext(current: string, flow: readonly string[]) {
  if (current === "cancelled") return { prev: null, next: null, isTerminal: true };
  // Legacy DB value out_for_delivery → treat as shipped step for 5-step flow
  if (current === "out_for_delivery") return { prev: "shipped", next: "delivered", isTerminal: false };
  const idx = flow.indexOf(current);
  if (idx === -1) return { prev: null, next: flow[0] ?? null, isTerminal: false };
  return {
    prev: idx > 0 ? flow[idx - 1] : null,
    next: idx < flow.length - 1 ? flow[idx + 1] : null,
    isTerminal: idx === flow.length - 1,
  };
}

export function OrderStatusControl({ currentStatus, onStatusChange, flow = DEFAULT_FLOW, disabled, style }: Props) {
  const { prev, next, isTerminal } = getPrevNext(currentStatus, flow);
  const reduced = useReducedMotion();
  const isSingle = !prev || !next || isTerminal || currentStatus === "cancelled";

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

  // Animation presets: 300-450ms ease-out, no bounce, overflow hidden
  const rollbackEntering = reduced
    ? FadeIn.duration(180)
    : FadeInUp.duration(380).easing(Easing.out(Easing.cubic)).withInitialValues({ transform: [{ translateY: 14 }], opacity: 0 });
  const nextEntering = reduced ? FadeIn.duration(180) : FadeIn.duration(260).easing(Easing.out(Easing.cubic));

  if (isSingle) {
    // Pending → single next full-width; Delivered/Cancelled → single completed
    const isCompleted = isTerminal || currentStatus === "cancelled";
    const label = isCompleted ? `${currentStatus} ✓` : next ? `${next}` : currentStatus;
    const onPress = isCompleted ? undefined : handleNext;
    const isDisabled = disabled || isCompleted || !next;

    return (
      <View style={[styles.container, styles.singleContainer, style]} accessibilityRole="toolbar">
        <Animated.View key={`single-${currentStatus}`} entering={nextEntering} exiting={FadeOut.duration(180)} style={styles.singleWrap}>
          <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? `Status ${currentStatus}` : `Move to ${next}`}
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
              style={[styles.singleText, isCompleted && styles.singleTextCompleted]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // Middle: both prev (secondary) and next (primary)
  return (
    <View style={[styles.container, style]} accessibilityRole="toolbar">
      {/* Rollback: reveals slowly with translate + opacity, overflow hidden prevents jump */}
      <View style={styles.rollbackClip}>
        <Animated.View
          key={`prev-${currentStatus}`}
          entering={rollbackEntering}
          exiting={FadeOut.duration(180)}
          style={styles.rollbackAnimated}
        >
          <Pressable
            onPress={handlePrev}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Rollback to ${prev}`}
            style={({ pressed }) => [styles.prevBtn, pressed && !disabled && styles.prevPressed]}
          >
            <Text style={styles.prevText}>{prev}</Text>
          </Pressable>
        </Animated.View>
      </View>

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
          style={({ pressed }) => [styles.nextBtn, pressed && !disabled && styles.nextPressed, (!next || disabled) && styles.nextDisabled]}
        >
          <Animated.Text key={`next-text-${currentStatus}`} entering={nextEntering} style={styles.nextText}>
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
    gap: 12,
    alignItems: "center",
    // overflow hidden prevents layout jump when rollback reveals
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
  rollbackClip: {
    flex: 1,
    overflow: "hidden",
  },
  rollbackAnimated: {
    flex: 1,
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
