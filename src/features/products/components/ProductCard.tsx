import { PressableScale } from "@/components/ui/PressableScale";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ProductWithRelations } from "../types";

type Props = {
  product: ProductWithRelations;
  onPress?: () => void;
};

export const ProductCard = memo(function ProductCard({ product, onPress }: Props) {
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const price = product.base_price;

  return (
    <Link href={`/product/${product.id}` as any} asChild>
      <PressableScale
        style={styles.card}
        onPress={onPress}
        pressedScale={0.985}
        accessibilityLabel={product.name}
      >
        <View style={styles.imageWrap}>
          <Image
            source={primary ? { uri: primary.image_url } : undefined}
            style={styles.image}
            contentFit="cover"
            transition={220}
            cachePolicy="memory-disk"
            priority="high"
          />
          <View style={styles.wish} pointerEvents="box-none">
            <WishlistButton productId={product.id} />
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.price}>${Number(price).toFixed(0)}</Text>
        </View>
      </PressableScale>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 8,
  },
  imageWrap: {
    aspectRatio: 0.78,
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
});
