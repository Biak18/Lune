import { View, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import type { ProductImage } from "../types";

type Props = {
  images: ProductImage[];
};

export function ProductGallery({ images }: Props) {
  const primary = images.find((i) => i.is_primary) ?? images[0];
  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: primary?.image_url ?? "https://picsum.photos/600/800" }}
        style={styles.main}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        accessibilityLabel={primary?.alt_text ?? "Product image"}
      />
      {images.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
          {images.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.image_url }}
              style={styles.thumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={img.alt_text ?? "Product thumbnail"}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  main: {
    width: "100%",
    aspectRatio: 0.78,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  thumbs: { gap: 8, paddingTop: 8 },
  thumb: {
    width: 72,
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
});
