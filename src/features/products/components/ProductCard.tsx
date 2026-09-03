import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import type { ProductWithRelations } from "../types";

type Props = {
  product: ProductWithRelations;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const price = product.base_price;

  return (
    <Link href={`/product/${product.id}` as any} asChild>
      <Pressable style={styles.card} onPress={onPress} accessibilityLabel={product.name}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: primary?.image_url ?? "https://picsum.photos/400/500" }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
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
      </Pressable>
    </Link>
  );
}

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
