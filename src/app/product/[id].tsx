import { useLocalSearchParams, router } from "expo-router";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useState, useMemo } from "react";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useProductQuery } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, isError, error } = useProductQuery(id);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colorsList = useMemo(() => {
    if (!product) return [];
    const s = new Set(product.variants.map((v) => v.color).filter(Boolean) as string[]);
    return Array.from(s);
  }, [product]);
  const sizesList = useMemo(() => {
    if (!product) return [];
    const s = new Set(product.variants.map((v) => v.size).filter(Boolean) as string[]);
    return Array.from(s);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
  }, [product, selectedColor, selectedSize]);

  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : false;
  const primaryImage = product?.images.find((i) => i.is_primary) ?? product?.images[0];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>We couldn&apos;t load this dress.</Text>
        <Text style={styles.errorSub}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.gallery}>
          <Image source={{ uri: primaryImage?.image_url ?? "https://picsum.photos/600/800" }} style={styles.mainImage} contentFit="cover" />
          {product.images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
              {product.images.map((img) => (
                <Image key={img.id} source={{ uri: img.image_url }} style={styles.thumb} contentFit="cover" />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${Number(product.base_price).toFixed(0)}</Text>
          {product.category ? <Text style={styles.category}>{product.category.name}</Text> : null}
          {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}
        </View>

        {/* Color selector */}
        {colorsList.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Color {selectedColor ? `— ${selectedColor}` : ""}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {colorsList.map((c) => {
                const active = selectedColor === c;
                return (
                  <Pressable key={c} onPress={() => setSelectedColor(c)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Size selector */}
        {sizesList.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Size {selectedSize ? `— ${selectedSize}` : ""}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {sizesList.map((s) => {
                const active = selectedSize === s;
                // Check if variant for this size+color combo exists and in stock
                const variantForSize = product.variants.find((v) => v.size === s && (selectedColor ? v.color === selectedColor : true));
                const disabled = !variantForSize || variantForSize.stock_quantity <= 0;
                return (
                  <Pressable
                    key={s}
                    onPress={() => !disabled && setSelectedSize(s)}
                    style={[styles.sizeChip, active && styles.chipActive, disabled && styles.chipDisabled]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {selectedVariant && (
          <Text style={[styles.stock, isOutOfStock && styles.oos]}>
            {isOutOfStock ? "Out of stock" : `${selectedVariant.stock_quantity} in stock • SKU ${selectedVariant.sku}`}
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isOutOfStock ? "Out of stock" : selectedVariant ? "Add to bag" : "Select size & color"}
          disabled={!selectedVariant || isOutOfStock}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    gap: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  errorSub: {
    fontSize: 13,
    color: colors.muted,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
    marginTop: 8,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  gallery: {
    gap: 8,
  },
  mainImage: {
    width: "100%",
    aspectRatio: 0.78,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  thumb: {
    width: 72,
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  category: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.clay,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeChip: {
    minWidth: 44,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.surface,
  },
  chipTextDisabled: {
    color: colors.muted,
  },
  stock: {
    fontSize: 12,
    color: colors.muted,
  },
  oos: {
    color: colors.error,
    fontWeight: "600",
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
