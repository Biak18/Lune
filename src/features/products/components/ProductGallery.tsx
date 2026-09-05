import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { ProductImage } from "../types";

type Props = {
  images: ProductImage[];
  selectedColor?: string | null;
  colorsList?: string[];
  hero?: boolean;
};

export function ProductGallery({ images, selectedColor, colorsList, hero = false }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const horizontalPadding = hero ? 0 : spacing.xl * 2;
  const pagerWidth = windowWidth - horizontalPadding;
  const heroHeight = hero ? Math.min(560, windowWidth * 1.25) : pagerWidth / 0.78;
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<ProductImage>>(null);
  const opacity = useSharedValue(1);

  const sorted = images.length
    ? [...images].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      })
    : [];

  const fade = useCallback(() => {
    // shared value mutation is intentional for reanimated fade
    // eslint-disable-next-line react-hooks/immutability
    opacity.value = withSequence(
      withTiming(0.35, { duration: 140 }),
      withTiming(1, { duration: 260 }),
    );
  }, [opacity]);

  const scrollToIndex = useCallback(
    async (index: number, withHaptic = true) => {
      if (sorted.length <= 1) return;
      const clamped = Math.max(0, Math.min(index, sorted.length - 1));
      fade();
      if (withHaptic) {
        try {
          await Haptics.selectionAsync();
        } catch {}
      }
      listRef.current?.scrollToOffset({
        offset: clamped * pagerWidth,
        animated: true,
      });
      setActiveIndex(clamped);
    },
    [sorted.length, pagerWidth, fade],
  );

  // Auto-switch on color tap removed per UX gallery stays manual (swipe/dots/thumbs only)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (sorted.length === 0) {
    return (
      <View style={[styles.pagerWrap, hero && styles.pagerWrapHero, { width: pagerWidth, height: heroHeight }]}>
        <View style={[styles.main, hero ? { width: pagerWidth, height: heroHeight } : { width: pagerWidth }]} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ProductImage }) => (
    <Animated.View style={[{ width: pagerWidth }, animatedStyle]}>
      <Image
        source={{ uri: item.image_url }}
        style={[styles.main, hero ? { width: pagerWidth, height: heroHeight } : { width: pagerWidth }]}
        contentFit="cover"
        transition={220}
        cachePolicy="memory-disk"
        accessibilityLabel={item.alt_text ?? "Product image"}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.wrap, hero && styles.wrapHero]}>
      <View
        style={[
          styles.pagerWrap,
          hero && styles.pagerWrapHero,
          { width: pagerWidth, height: heroHeight },
        ]}
      >
        <FlatList
          ref={listRef}
          data={sorted}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={pagerWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
          getItemLayout={(_, index) => ({
            length: pagerWidth,
            offset: pagerWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / pagerWidth);
            setActiveIndex(idx);
          }}
          renderItem={renderItem}
         showsVerticalScrollIndicator={false} />
        {/* Dots overlay */}
        {sorted.length > 1 && (
          <View style={styles.dots} pointerEvents="box-none">
            {sorted.map((img, idx) => {
              const active = idx === activeIndex;
              return (
                <Pressable
                  key={img.id + "-dot"}
                  onPress={() => scrollToIndex(idx)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`View image ${idx + 1} of ${sorted.length}${active ? " selected" : ""}`}
                  accessibilityState={{ selected: active }}
                  style={[styles.dot, active && styles.dotActive]}
                />
              );
            })}
          </View>
        )}
      </View>

      {sorted.length > 1 && (
        <View style={styles.thumbs}>
          {sorted.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <Pressable
                key={img.id + "-thumb"}
                onPress={() => scrollToIndex(idx)}
                style={[styles.thumbWrap, active && styles.thumbActive]}
                accessibilityRole="button"
                accessibilityLabel={`Thumbnail ${idx + 1}`}
              >
                <Image
                  source={{ uri: img.image_url }}
                  style={styles.thumb}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  accessibilityLabel={img.alt_text ?? "Product thumbnail"}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  wrapHero: { gap: 0 },
  pagerWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    position: "relative",
  },
  pagerWrapHero: {
    borderRadius: 0,
  },
  main: {
    height: "100%",
    aspectRatio: 0.78,
    backgroundColor: colors.surfaceMuted,
  },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(42,27,22,0.12)",
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  thumbs: {
    flexDirection: "row",
    gap: 8,
  },
  thumbWrap: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  thumbActive: {
    borderColor: colors.foreground,
  },
  thumb: {
    width: 72,
    height: 90,
    backgroundColor: colors.surfaceMuted,
  },
});
