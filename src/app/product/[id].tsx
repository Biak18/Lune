import { useLocalSearchParams, router } from "expo-router";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { useProductQuery } from "@/features/products/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ColorSelector } from "@/features/products/components/ColorSelector";
import { SizeSelector } from "@/features/products/components/SizeSelector";
import { StockBadge } from "@/features/products/components/StockBadge";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { RatingStars } from "@/features/reviews/components/RatingStars";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { useReviewsQuery, useReviewAvgQuery, useVerifiedPurchaseQuery, useCreateReview, useUpdateReview, useDeleteReview } from "@/features/reviews/hooks/useReviews";
import { useAuthStore } from "@/stores/authStore";
import { CompleteTheLook } from "@/features/outfit/components/CompleteTheLook";
import { RecommendationCarousel } from "@/features/recommendations/components/RecommendationCarousel";
import { useSimilarProducts, useOccasionRecommendations } from "@/features/recommendations/hooks/useRecommendations";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import {
  getActiveVariants,
  getUniqueColors,
  getUniqueSizes,
  findVariant,
  resolveVariantPrice,
  validateVariantSelection,
  validationMessage,
  isVariantInStock,
} from "@/features/products/utils/variant";

export default function ProductScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: product, isLoading, isError, error, refetch } = useProductQuery(id ?? "");

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const activeVariants = useMemo(() => {
    if (!product) return [];
    return getActiveVariants(product);
  }, [product]);

  const colorsList = useMemo(() => getUniqueColors(activeVariants), [activeVariants]);
  const sizesList = useMemo(() => getUniqueSizes(activeVariants), [activeVariants]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    // Use active variants for lookup; inactive should not be purchasable
    return findVariant(activeVariants, selectedColor, selectedSize);
  }, [product, activeVariants, selectedColor, selectedSize]);

  const validation = useMemo(() => {
    if (!product) return null;
    // If product has no variants at all (edge case), treat as unavailable
    if (activeVariants.length === 0) return { ok: false as const, reason: "unavailable" as const };
    return validateVariantSelection(product, selectedColor, selectedSize);
  }, [product, activeVariants, selectedColor, selectedSize]);

  const isValid = validation?.ok === true;
  const price = useMemo(() => {
    if (!product) return null;
    return resolveVariantPrice(product, selectedVariant);
  }, [product, selectedVariant]);

  const ctaTitle = useMemo(() => {
    if (!product) return "Add to bag";
    if (activeVariants.length === 0) return "Unavailable";
    if (!validation) return "Select options";
    if (validation.ok) return "Add to bag";
    switch (validation.reason) {
      case "select_color":
        return "Select color";
      case "select_size":
        return "Select size";
      case "select_variant":
        return "Select options";
      case "out_of_stock":
        return "Out of stock";
      case "unavailable":
        return selectedColor && selectedSize ? "Unavailable" : "Select size & color";
      default:
        return "Select options";
    }
  }, [product, activeVariants.length, validation, selectedColor, selectedSize]);

  const ctaDisabled = !isValid || (selectedVariant ? !isVariantInStock(selectedVariant) : true);
  const addToCart = useAddToCart();

  // Reviews hooks must be before any early returns to keep hook order stable
  const user = useAuthStore((s) => s.user);
  const productIdForReviews = product?.id ?? id ?? "";
  const { data: reviews, isLoading: reviewsLoading } = useReviewsQuery(productIdForReviews);
  const { data: avgData } = useReviewAvgQuery(productIdForReviews);
  const { data: verifiedData } = useVerifiedPurchaseQuery(productIdForReviews);
  const createReview = useCreateReview(productIdForReviews);
  const updateReview = useUpdateReview(productIdForReviews);
  const deleteReview = useDeleteReview(productIdForReviews);
  const [editingId, setEditingId] = useState<string | null>(null);

  const avg = avgData?.avg ?? 0;
  const count = avgData?.count ?? 0;
  const myReview = reviews?.find((r) => r.user_id === user?.id) ?? null;
  const isVerified = verifiedData?.verified ?? false;

  // Recommendations (recently viewed still tracked for Home, but not shown here per request)
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const { data: similar, isLoading: similarLoading } = useSimilarProducts(product ?? null);
  const { data: occasionRecs, isLoading: occLoading } = useOccasionRecommendations(product?.occasion ?? null, product?.id);

  useEffect(() => {
    if (product?.id) addRecent(product.id);
  }, [product?.id, addRecent]);

  const handleAddToBag = async () => {
    if (!validation || !validation.ok || !selectedVariant) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      return;
    }
    try {
      await addToCart.mutateAsync({ variantId: selectedVariant.id, quantity: 1 });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/(tabs)/cart" as any);
    } catch (e: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      // error will surface via mutation error; for now no toast UI
      if (__DEV__) console.warn("[cart] add failed", e?.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator color={colors.foreground} />
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.errorTitle}>We couldn&apos;t load this dress.</Text>
        <Text style={styles.errorSub}>{String((error as Error)?.message ?? "Try again")}</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  if (!product) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.errorTitle}>Not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const hasVariants = activeVariants.length > 0;
  const showVariantSection = hasVariants && (colorsList.length > 0 || sizesList.length > 0);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <ProductGallery images={product.images} selectedColor={selectedColor} colorsList={colorsList} />

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.name}>{product.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={styles.price}>${Number(price ?? product.base_price).toFixed(0)}</Text>
                {selectedVariant?.price != null && Number(selectedVariant.price) !== Number(product.base_price) ? (
                  <Text style={styles.basePrice}>${Number(product.base_price).toFixed(0)}</Text>
                ) : null}
              </View>
              {product.category ? <Text style={styles.category}>{product.category.name}</Text> : null}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                <RatingStars value={avg} size={14} />
                <Text style={styles.ratingText}>
                  {count ? `${avg.toFixed(1)} • ${count} ${count === 1 ? "review" : "reviews"}` : "No reviews yet"}
                </Text>
                {isVerified && <Text style={styles.verifiedHint}>• Verified buyer eligible</Text>}
              </View>
            </View>
            <WishlistButton productId={product.id} size={42} style={{ marginTop: 2 }} />
          </View>
          {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}
        </View>

        {!hasVariants ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>This item is currently unavailable.</Text>
          </View>
        ) : showVariantSection ? (
          <>
            <ColorSelector
              colorsList={colorsList}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
              variants={activeVariants}
              selectedSize={selectedSize}
            />
            <SizeSelector
              sizes={sizesList}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
              variants={activeVariants}
              selectedColor={selectedColor}
            />
            {/* Stock + variant summary */}
            <View style={styles.stockWrap}>
              {selectedColor || selectedSize ? (
                <StockBadge variant={selectedVariant} />
              ) : (
                <Text style={styles.stockHint}>Choose a color and size to see availability</Text>
              )}
              {!isValid && validation && validation.reason !== "select_color" && validation.reason !== "select_size" && selectedColor && selectedSize ? (
                <Text style={styles.validation}>{validationMessage(validation.reason)}</Text>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviewsLoading ? (
            <View style={styles.centerSmall}>
              <ActivityIndicator color={colors.foreground} />
            </View>
          ) : (
            <>
              {!myReview && (
                <>
                  {!user ? (
                    <View style={styles.notice}>
                      <Text style={styles.noticeText}>Sign in to write a review.</Text>
                      <Pressable onPress={() => router.push("/auth/login" as any)} style={{ marginTop: 8 }}>
                        <Text style={styles.link}>Sign in</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <ReviewForm
                      submitting={createReview.isPending}
                      onSubmit={async ({ rating, body }) => {
                        try {
                          await createReview.mutateAsync({ rating, body });
                          try {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          } catch {}
                        } catch (e) {
                          try {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          } catch {}
                        }
                      }}
                    />
                  )}
                  {!isVerified && user && <Text style={styles.verifiedHint}>Purchase this item to get a verified badge.</Text>}
                </>
              )}

              {myReview && editingId !== myReview.id ? (
                <ReviewCard
                  review={myReview}
                  onEdit={() => setEditingId(myReview.id)}
                  onDelete={async () => {
                    try {
                      await deleteReview.mutateAsync(myReview.id);
                      try {
                        await Haptics.selectionAsync();
                      } catch {}
                    } catch {}
                  }}
                />
              ) : null}

              {myReview && editingId === myReview.id && (
                <ReviewForm
                  initialRating={myReview.rating}
                  initialBody={myReview.body ?? ""}
                  submitting={updateReview.isPending}
                  submitLabel="Update review"
                  onSubmit={async ({ rating, body }) => {
                    await updateReview.mutateAsync({ reviewId: myReview.id, rating, body });
                    setEditingId(null);
                    try {
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } catch {}
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )}

              {reviews?.filter((r) => r.id !== myReview?.id).length ? (
                <View style={{ gap: 10 }}>
                  {reviews
                    .filter((r) => r.id !== myReview?.id)
                    .map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                </View>
              ) : !myReview ? (
                <Text style={styles.stockHint}>No reviews yet. Be the first to review.</Text>
              ) : null}
            </>
          )}
        </View>

        <CompleteTheLook product={product} />

        <RecommendationCarousel
          title="Similar in category"
          subtitle={product.category ? `More from ${product.category.name}` : undefined}
          products={similar ?? []}
          isLoading={similarLoading}
        />
        <RecommendationCarousel
          title={`More for ${product.occasion ?? "everyday"}`}
          subtitle="Occasion-based picks"
          products={occasionRecs ?? []}
          isLoading={occLoading}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ gap: 6 }}>
          <Button
            title={addToCart.isPending ? "Adding…" : ctaTitle}
            disabled={ctaDisabled || addToCart.isPending}
            loading={addToCart.isPending}
            onPress={handleAddToBag}
            accessibilityLabel={ctaTitle}
          />
          {addToCart.isError && (
            <Text style={styles.validation}>{String((addToCart.error as Error)?.message ?? "Could not add to bag")}</Text>
          )}
          {!isValid && hasVariants && selectedColor && selectedSize && validation && !validation.ok ? (
            <Text style={styles.footerHint}>{validationMessage(validation.reason)}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
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
  retryBtn: {
    marginTop: 8,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.surface,
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
  basePrice: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
    textDecorationLine: "line-through",
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
  stockWrap: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
    paddingBottom: 4,
  },
  stockHint: {
    fontSize: 12,
    color: colors.muted,
  },
  validation: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
  },
  footerHint: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },
  notice: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    fontSize: 13,
    color: colors.muted,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  ratingText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  verifiedHint: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  reviewsSection: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  centerSmall: {
    padding: 16,
    alignItems: "center",
  },
});
