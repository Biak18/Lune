import { StyleProp, ViewStyle } from "react-native";

type Props = {
  source: number;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: () => void;
};

/**
 * Web fallback — renders nothing. lottie-react-native's web runtime has had
 * React 19/Expo-web compatibility gaps; the animations are a progressive
 * enhancement and the surrounding compositions read without them.
 */
export function LottieAnimation(_props: Props) {
  return null;
}
