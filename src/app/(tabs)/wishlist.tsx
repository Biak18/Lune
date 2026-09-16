import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { fontFamily } from "@/design/typography";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useWishlistQuery } from "@/features/wishlist/hooks/useWishlist";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

function WishlistSkeleton() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, padding: spacing.xl }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} style={{ width: "48%" }} />
      ))}
    </View>
  );
}

export default function WishlistScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: products, isLoading, isError, error, refetch, isRefetching } = useWishlistQuery();
  const addToCart = useAddToCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    []
  );

  if (!user) {
    return (
      <Screen centered>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.sub}>Sign in to save your favorites</Text>
        <Text style={styles.desc}>Create a wishlist that follows you across sessions.</Text>
        <Button
          title="Sign in"
          onPress={() => router.push("/auth/login" as any)}
          style={{ marginTop: spacing.lg }}
        />
        <Pressable onPress={() => router.push("/shop" as any)} style={{ marginTop: 12 }}>
          <Text style={styles.link}>Continue browsing</Text>
        </Pressable>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen scrollable={false} padded={false} contentStyle={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <WishlistSkeleton />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen centered>
        <Text style={styles.sub}>We couldn&apos;t load your wishlist.</Text>
        <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Button title={isRefetching ? "Retrying…" : "Retry"} onPress={() => refetch()} style={{ marginTop: 12 }} />
        <Pressable onPress={() => router.push("/shop" as any)} style={{ marginTop: 8 }}>
          <Text style={styles.link}>Browse shop</Text>
        </Pressable>
      </Screen>
    );
  }

  const list = products ?? [];

  if (list.length === 0) {
    return (
      <Screen centered>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="heart-outline" size={24} color={colors.muted} />
        </View>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.sub}>Your wishlist is empty.</Text>
        <Text style={styles.desc}>Save styles you love — tap the heart on any product to keep it here.</Text>
        <Button
          title="Explore products"
          onPress={() => router.push("/shop" as any)}
          style={{ marginTop: spacing.lg }}
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} padded={false} contentStyle={styles.root}>
      <Reveal index={0} style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.count}>{list.length} {list.length === 1 ? "item" : "items"}</Text>
      </Reveal>

      <Reveal index={1} style={{ flex: 1 }}>
        <FlashList
          data={list}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.foreground}
              colors={[colors.foreground]}
            />
          }
          renderItem={({ item }) => {
            const firstInStock = item.variants.find((v) => v.is_active && (v.stock_quantity ?? 0) > 0) ?? null;
            const canAdd = !!firstInStock;
            return (
              <View style={{ flex: 1, padding: 6 }}>
                <ProductCard product={item} />
                <Pressable
                  onPress={async () => {
                    if (!canAdd || !firstInStock) {
                      try {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      } catch {}
                      return;
                    }
                    // Stay on the wishlist: optimistic cart + transient "Added" label keep browsing momentum
                    addToCart.mutate(
                      { variantId: firstInStock.id, quantity: 1 },
                      {
                        onSuccess: async () => {
                          try {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          } catch {}
                          setAddedId(item.id);
                          if (addedTimer.current) clearTimeout(addedTimer.current);
                          addedTimer.current = setTimeout(() => setAddedId(null), 2200);
                        },
                        onError: async () => {
                          try {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          } catch {}
                        },
                      }
                    );
                  }}
                  disabled={!canAdd}
                  style={[styles.addBag, !canAdd && { opacity: 0.5 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.name} to bag`}
                >
                  <Text style={styles.addBagText}>
                    {addedId === item.id ? "Added to bag" : canAdd ? "Move to bag" : "Out of stock"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
         showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
      </Reveal>
    </Screen>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "500",
    letterSpacing: -0.6,
    color: colors.foreground,
    fontFamily: fontFamily.display,
  },
  count: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: colors.foreground,
    fontFamily: fontFamily.display,
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
