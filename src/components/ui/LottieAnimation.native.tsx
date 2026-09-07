import LottieView, { LottieViewProps } from "lottie-react-native";
import { useEffect, useState } from "react";
import {
    AccessibilityInfo,
    StyleProp,
    ViewStyle,
} from "react-native";

type LottieSource = NonNullable<LottieViewProps["source"]>;

type Props = {
  /** Metro asset module, e.g. require("@/assets/lottie/order-seal.json") */
  source: number;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: () => void;
};

/**
 * Lottie player for native platforms. Plays automatically; respects the OS
 * reduce-motion setting by showing the final frame instead of animating.
 * Web uses the platform fallback (LottieAnimation.tsx).
 */
export function LottieAnimation({
  source,
  loop = false,
  style,
  onAnimationFinish,
}: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return (
    <LottieView
      // Metro require() returns an asset-module number at runtime; the
      // library's typings don't include it, but it is the documented usage.
      source={source as unknown as LottieSource}
      autoPlay={!reduceMotion}
      loop={loop && !reduceMotion}
      progress={reduceMotion ? 1 : undefined}
      style={style}
      onAnimationFinish={onAnimationFinish}
      cacheComposition
    />
  );
}
