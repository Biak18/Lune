import { Button } from "@/components/ui/Button";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import type { ProductWithRelations } from "@/features/products/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCompleteTheLook } from "../hooks/useCompleteTheLook";

type Props = {
  product: ProductWithRelations;
};

export function CompleteTheLook({ product }: Props) {
  const {
    data: items,
    isLoading,
    isError,
    refetch,
  } = useCompleteTheLook(product);
  const addToCart = useAddToCart();
  const [addingAll, setAddingAll] = useState(false);

  const handleAddOutfit = async () => {
    if (!items?.length) return;
    setAddingAll(true);
    let added = 0;
    for (const p of items) {
      const firstInStock = p.variants.find(
        (v) => v.is_active && (v.stock_quantity ?? 0) > 0,
      );
      if (!firstInStock) continue;
      try {
        await addToCart.mutateAsync({
          variantId: firstInStock.id,
          quantity: 1,
        });
        added += 1;
      } catch {}
    }
    setAddingAll(false);
    try {
      if (added > 0)
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      else
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
    } catch {}
    if (added > 0) router.push("/(tabs)/cart" as any);
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Complete the Look</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 120,
                height: 150,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceMuted,
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Complete the Look</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.link}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!items?.length) return null;

  const outfitTotal =
    items.reduce((sum, p) => sum + Number(p.base_price), 0) +
    Number(product.base_price);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 2 }}>
          <Text style={styles.eyebrow}>Outfit</Text>
          <Text style={styles.title}>Complete the Look</Text>
          <Text style={styles.desc}>
            Curated with {product.occasion ?? "everyday"} •{" "}
            {product.style ?? "minimal"} • different category
          </Text>
        </View>
        <Text style={styles.count}>{100} pieces</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        style={{ marginHorizontal: -2 }}
        contentContainerStyle={{ gap: 12, paddingRight: 4, paddingVertical: 2 }}
      >
        {/* Current product */}
        <View style={styles.tileActive}>
          <Image
            source={{
              uri:
                (product.images.find((i) => i.is_primary) ?? product.images[0])
                  ?.image_url ?? "https://picsum.photos/300/400",
            }}
            style={styles.tileImg}
            contentFit="cover"
          />
          <Text style={styles.tileName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.tilePrice}>
            ${Number(product.base_price).toFixed(0)} • yours
          </Text>
        </View>
        {items.map((p) => {
          const img = p.images.find((i) => i.is_primary) ?? p.images[0];
          return (
            <Link key={p.id} href={`/product/${p.id}` as any} asChild>
              <Pressable style={styles.tile}>
                <Image
                  source={{
                    uri: img?.image_url ?? "https://picsum.photos/300/400",
                  }}
                  style={styles.tileImg}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <Text style={styles.tileName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.tilePrice}>
                  ${Number(p.base_price).toFixed(0)}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.outfitLabel}>Outfit total</Text>
          <Text style={styles.outfitTotal}>${outfitTotal.toFixed(0)}</Text>
        </View>
        <Button
          title={addingAll ? "Adding…" : "Add complete outfit"}
          onPress={handleAddOutfit}
          loading={addingAll}
          disabled={addingAll}
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>

      <Text style={styles.hint}>
        Adds first in-stock variant of each related piece • Stock validated at
        checkout
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.clay,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: colors.foreground,
    marginTop: 2,
  },
  desc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  count: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    flex: 0,
  },
  tileActive: {
    width: 140,
    gap: 6,
    opacity: 0.9,
    borderWidth: 1,
    borderColor: colors.foreground,
    borderRadius: radius.lg,
    padding: 6,
    backgroundColor: colors.surfaceMuted,
  },
  tile: {
    width: 140,
    gap: 6,
  },
  tileImg: {
    width: "100%",
    aspectRatio: 0.78,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  tileName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  tilePrice: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  outfitLabel: {
    fontSize: 11,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  outfitTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.foreground,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  hint: {
    fontSize: 11,
    color: colors.mutedLight,
    textAlign: "center",
  },
});
