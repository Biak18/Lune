import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { ProductWithRelations } from "../types";

const CARD_WIDTH = 260;
const CARD_HEIGHT = 342;
const SPACING = 14;
const ITEM_SIZE = CARD_WIDTH + SPACING;

// Fixed estimate of the name/price/category text block height. Needed
// because the back face is absolutely positioned over the front -- without
// an explicit container height, RN has nothing to size it against. Same
// caveat as before: a product name wrapping to 2 lines under a larger
// accessibility font size will clip rather than grow.
const META_HEIGHT = 64;
const CARD_TOTAL_HEIGHT = CARD_HEIGHT + 8 + META_HEIGHT;

type Props = {
  products: ProductWithRelations[];
};

function CarouselItem({
  product,
  index,
  scrollX,
}: {
  product: ProductWithRelations;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];

  // Position/scale only -- kept separate from the flip's rotateY so the
  // card's spatial placement in the coverflow doesn't get tangled up with
  // which face is visible.
  const outerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.86, 1, 0.86],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [18, 0, -18],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }, { translateX }] };
  });

  // Sweeps a full 180 -> 0 -> -180 across the three snap points (vs. the
  // original's 28deg tilt), so a card fully rotates through to its back face
  // as it scrolls away from center in either direction.
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [180, 0, -180],
      Extrapolation.CLAMP,
    );
    const fade = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }],
      // Hard cutoff past 90deg, matching FlipCard's approach: backfaceVisibility
      // should handle this alone but isn't reliable enough on Android on its own.
      opacity: Math.abs(rotateY) > 90 ? 0 : fade,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [180, 0, -180],
      Extrapolation.CLAMP,
    );
    // +180 offset from the front's live angle works across the whole
    // -180..180 sweep without a sign branch: at rotateY=0 (front facing,
    // centered) this lands on 180 (back facing away, hidden); at rotateY=
    // +-180 (front facing away) this lands on 0/360 (back facing viewer,
    // visible). Verify this by scrolling slowly -- confirm there's no seam
    // or flicker right at the 90deg handoff before shipping.
    const backRotateY = rotateY + 180;
    return {
      transform: [{ perspective: 900 }, { rotateY: `${backRotateY}deg` }],
      opacity: Math.abs(rotateY) > 90 ? 1 : 0,
    };
  });

  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <Animated.View
      style={[{ width: CARD_WIDTH, height: CARD_TOTAL_HEIGHT }, outerStyle]}
    >
      <Link href={`/product/${product.id}` as any} asChild>
        <Pressable
          style={styles.faceContainer}
          accessibilityLabel={product.name}
        >
          <Animated.View style={[styles.face, frontStyle]}>
            <View style={styles.imageWrap}>
              <Image
                source={{
                  uri: primary?.image_url ?? "https://picsum.photos/400/500",
                }}
                style={styles.image}
                contentFit="cover"
                transition={220}
                cachePolicy="memory-disk"
              />
              <View style={styles.wish} pointerEvents="box-none">
                <WishlistButton productId={product.id} size={28} />
              </View>
            </View>
            <View style={styles.meta}>
              <Text style={styles.name} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.price}>
                ${Number(product.base_price).toFixed(0)}
              </Text>
              {product.category ? (
                <Text style={styles.cat}>{product.category.name}</Text>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View style={[styles.face, styles.backFace, backStyle]}>
            <Text style={styles.backWordmark}>LUNE</Text>
            {product.category ? (
              <Text style={styles.backCat}>{product.category.name}</Text>
            ) : null}
          </Animated.View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

export function Featured3DCarousel({ products }: Props) {
  const windowWidth = Dimensions.get("window").width;
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const sidePadding = (windowWidth - CARD_WIDTH) / 2;
  const snapOffsets = products.map((_, i) => i * ITEM_SIZE);

  if (!products.length) return null;

  return (
    <View style={styles.wrap}>
      <Animated.FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View
            style={{ marginRight: index === products.length - 1 ? 0 : SPACING }}
          >
            <CarouselItem product={item} index={index} scrollX={scrollX} />
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -spacing.xl,
  },
  faceContainer: {
    width: CARD_WIDTH,
    height: CARD_TOTAL_HEIGHT,
  },
  face: {
    backfaceVisibility: "hidden",
    width: "100%",
    height: "100%",
    gap: 8,
  },
  backFace: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: radius.lg,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imageWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  wish: {
    position: "absolute",
    right: 8,
    bottom: 8,
  },
  meta: {
    gap: 2,
    paddingHorizontal: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.foreground,
    lineHeight: 16,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  cat: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.clay,
  },
  backWordmark: {
    fontSize: 20,
    letterSpacing: 2.4,
    fontWeight: "800",
    color: colors.surface,
  },
  backCat: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.surface,
    opacity: 0.75,
  },
});
