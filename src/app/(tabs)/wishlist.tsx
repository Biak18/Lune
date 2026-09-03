import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistQuery } from "@/features/wishlist/hooks/useWishlist";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/features/products/components/ProductCard";
import * as Haptics from "expo-haptics";
import { useAddToCart } from "@/features/cart/hooks/useCart";

function WishlistSkeleton() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, padding: spacing.xl }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={{ width: "48%", gap: 8 }}>
          <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
          <Skeleton style={{ height: 12, borderRadius: 6 }} />
          <Skeleton style={{ height: 12, width: "60%", borderRadius: 6 }} />
        </View>
      ))}
    </View>
  );
}

export default function WishlistScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: products, isLoading, isError, error, refetch, isRefetching } = useWishlistQuery();
  const addToCart = useAddToCart();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.sub}>Sign in to save your favorites</Text>
        <Text style={styles.desc}>Create a wishlist that follows you across sessions.</Text>
        <Link href={"/auth/login" as any} asChild>
          <Button title="Sign in" style={{ marginTop: spacing.lg }} />
        </Link>
        <Pressable onPress={() => router.push("/shop" as any)} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Continue browsing</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <WishlistSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.sub}>We couldn&apos;t load your wishlist.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title={isRefetching ? "Retrying…" : "Retry"} onPress={() => refetch()} style={{ marginTop: 12 }} />
        <Pressable onPress={() => router.push("/shop" as any)} style={{ marginTop: 8 }}>
          <Text style={styles.link}>Browse shop</Text>
        </Pressable>
      </View>
    );
  }

  const list = products ?? [];

  if (list.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.sub}>Your wishlist is empty.</Text>
        <Text style={styles.desc}>Save styles you love — heart any product to keep it here.</Text>
        <Link href={"/shop" as any} asChild>
          <Button title="Explore products" style={{ marginTop: spacing.lg }} />
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.count}>{list.length} {list.length === 1 ? "item" : "items"}</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: spacing.xl, gap: 12, paddingBottom: 32 }}
        renderItem={({ item }) => {
          const firstInStock = item.variants.find((v) => v.is_active && (v.stock_quantity ?? 0) > 0) ?? null;
          const canAdd = !!firstInStock;
          return (
            <View style={{ flex: 1 }}>
              <ProductCard product={item} />
              <Pressable
                onPress={async () => {
                  if (!canAdd || !firstInStock) {
                    try {
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    } catch {}
                    return;
                  }
                  try {
                    await addToCart.mutateAsync({ variantId: firstInStock.id, quantity: 1 });
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.push("/(tabs)/cart" as any);
                  } catch (e) {
                    try {
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    } catch {}
                  }
                }}
                disabled={!canAdd || addToCart.isPending}
                style={[styles.addBag, (!canAdd || addToCart.isPending) && { opacity: 0.5 }]}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name} to bag`}
              >
                <Text style={styles.addBagText}>{canAdd ? "Move to bag" : "Out of stock"}</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  count: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
  },
  sub: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: 8,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  addBag: {
    marginTop: 8,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addBagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
});
