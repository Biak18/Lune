import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from "react-native-reanimated";
import { useFavoriteIdsQuery, useToggleWishlist } from "../hooks/useWishlist";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/colors";
import { router } from "expo-router";

type Props = {
  productId: string;
  size?: number;
  style?: ViewStyle;
  hitSlop?: number;
};

export function WishlistButton({ productId, size = 28, style, hitSlop = 8 }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: favIds } = useFavoriteIdsQuery();
  const toggle = useToggleWishlist();
  const scale = useSharedValue(1);

  const isFav = favIds?.has(productId) ?? false;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async (e?: any) => {
    try {
      e?.stopPropagation?.();
      e?.preventDefault?.();
    } catch {}
    if (!user) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      router.push("/auth/login" as any);
      return;
    }
    const nextFav = !isFav;
    try {
      if (nextFav) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else await Haptics.selectionAsync();
    } catch {}
    // subtle pop shared value mutation intentional
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSequence(withSpring(1.18, { damping: 8, stiffness: 200 }), withSpring(1, { damping: 10 }));
    toggle.mutate({ productId, isCurrentlyFavorite: isFav });
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      disabled={toggle.isPending}
      accessibilityRole="button"
      accessibilityLabel={isFav ? "Remove from wishlist" : "Add to wishlist"}
      accessibilityState={{ selected: isFav, busy: toggle.isPending }}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2 }, style, isFav && styles.fav, toggle.isPending && { opacity: 0.7 }]}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name={isFav ? "heart" : "heart-outline"} size={14} color={isFav ? colors.clayDeep : colors.foreground} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fav: {
    backgroundColor: colors.roseSoft,
    borderColor: colors.rose,
  },
});
