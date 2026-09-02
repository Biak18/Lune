import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
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
          <Pressable style={styles.wish} hitSlop={8} onPress={() => {}}>
            <Ionicons name="heart-outline" size={14} color={colors.foreground} />
          </Pressable>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  wishText: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.foreground,
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
