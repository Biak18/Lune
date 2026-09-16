import { LottieAnimation } from "@/components/ui/LottieAnimation";
import { Screen } from "@/components/ui/Screen";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { fontFamily } from "@/design/typography";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { ProductCard } from "@/features/products/components/ProductCard";
import {
  useCategoriesQuery,
  useProductsQuery,
} from "@/features/products/hooks/useProducts";
import { RecommendationCarousel } from "@/features/recommendations/components/RecommendationCarousel";
import { useRecentlyViewedProducts } from "@/features/recommendations/hooks/useRecommendations";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();
  const { data: featured, isLoading: loadingFeat } = useProductsQuery({
    style: "elegant",
    pageSize: 4,
  });
  const { data: newArrivals, isLoading: loadingNew } = useProductsQuery({
    sort: "newest",
    pageSize: 4,
  });
  const { data: bestSellers, isLoading: loadingBest } = useProductsQuery({
    sort: "top_rated",
    pageSize: 4,
  });
  const { data: recentProds, isLoading: loadingRecent } =
    useRecentlyViewedProducts();

  return (
    <Screen contentStyle={styles.content} padded={false}>
      {/* Header minimal wordmark + actions */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.wordmark}>LUNE</Text>
          <View style={styles.dot} />
          <Text style={styles.season}>FW 2026</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <NotificationBell size={24} />
        </View>
      </View>

      {/* Hero editorial atelier sketch, no photo dependency */}
      <View style={styles.hero}>
        <LottieAnimation
          source={require("@/assets/lottie/dress-sketch.json")}
          style={styles.heroSketch}
        />
        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>The new collection</Text>
          <Text style={styles.heroTitle}>
            Effortless{"\n"}
            <Text style={styles.heroTitleAccent}>elegance</Text>
          </Text>
          <Text style={styles.heroSub}>Made to move with you</Text>
          <Pressable
            style={styles.heroBtn}
            onPress={() => router.push("/shop" as any)}
          >
            <Text style={styles.heroBtnText}>Shop now</Text>
          </Pressable>
        </View>
      </View>

      {/* Categories image tiles, not chips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <Pressable hitSlop={8} onPress={() => router.push("/shop" as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {catsLoading ? (
          <View style={{ flexDirection: "row", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ alignItems: "center", gap: 8 }}>
                <Skeleton style={{ width: 72, height: 72, borderRadius: 36 }} />
                <Skeleton style={{ width: 48, height: 10, borderRadius: 6 }} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingRight: spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {categories?.map((c) => (
              <Pressable
                key={c.id}
                style={styles.catTile}
                accessibilityLabel={c.name}
                onPress={() => router.push(`/category/${c.id}` as any)}
              >
                <View style={styles.catImageWrap}>
                  <Image
                    source={{
                      uri:
                        c.image_url ?? "https://picsum.photos/seed/cat/200/200",
                    }}
                    style={styles.catImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Featured hidden when no active products (admin may hide all) */}
      {loadingFeat ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionHint}>Curated</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {[1, 2].map((i) => (
              <ProductCardSkeleton key={i} lines={1} style={{ flex: 1 }} />
            ))}
          </View>
        </View>
      ) : featured?.data?.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionHint}>Curated</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {featured.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* New Arrivals hidden when empty */}
      {loadingNew ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <Pressable onPress={() => router.push("/shop" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {[1, 2].map((i) => (
              <ProductCardSkeleton key={i} lines={1} style={{ flex: 1 }} />
            ))}
          </View>
        </View>
      ) : newArrivals?.data?.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <Pressable onPress={() => router.push("/shop" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {newArrivals.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Best Sellers hidden when no products/ratings */}
      {loadingBest ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <Text style={styles.sectionHint}>Top rated</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {[1, 2].map((i) => (
              <ProductCardSkeleton key={i} lines={1} style={{ flex: 1 }} />
            ))}
          </View>
        </View>
      ) : bestSellers?.data?.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <Text style={styles.sectionHint}>Top rated</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {bestSellers.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Empty catalog hint */}
      {!loadingFeat &&
      !loadingNew &&
      !loadingBest &&
      !featured?.data?.length &&
      !newArrivals?.data?.length &&
      !bestSellers?.data?.length ? (
        <View style={styles.emptyCatalog}>
          <Text style={styles.emptyCatalogTitle}>No collections available</Text>
          <Text style={styles.emptyCatalogSub}>
            Products are currently hidden
          </Text>
        </View>
      ) : null}

      {/* Discover */}
      <View style={styles.discoverCard}>
        <View style={styles.discoverHeader}>
          <Text style={styles.discoverEyebrow}>Discover</Text>
          <Text style={styles.discoverTitle}>Find your perfect piece</Text>
          <Text style={styles.discoverDesc}>
            Answer two questions or chat with our stylist
          </Text>
        </View>
        <View style={styles.discoverActions}>
          <Pressable
            style={[styles.discoverBtn, styles.discoverPrimary]}
            onPress={() => router.push("/style-finder" as any)}
          >
            <Ionicons
              name="color-palette-outline"
              size={14}
              color={colors.surface}
            />
            <Text style={styles.discoverPrimaryText}>Style Finder</Text>
          </Pressable>
          <Pressable
            style={[styles.discoverBtn, styles.discoverSecondary]}
            onPress={() => router.push("/assistant" as any)}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={14}
              color={colors.foreground}
            />
            <Text style={styles.discoverSecondaryText}>AI Stylist</Text>
          </Pressable>
        </View>
      </View>

      {/* Occasion quiet pills */}

      {recentProds && recentProds.length > 0 && (
        <RecommendationCarousel
          title="Recently viewed"
          subtitle="Pick up where you left off"
          products={recentProds}
          isLoading={loadingRecent}
          onSeeAll={() => router.push("/(tabs)/shop" as any)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: 28,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordmark: {
    fontSize: 13,
    letterSpacing: 2.08,
    fontWeight: "800",
    color: colors.foreground,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.clay,
  },
  season: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.muted,
  },
  hero: {
    height: 440,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroSketch: {
    position: "absolute",
    top: 12,
    right: -6,
    width: 250,
    height: 250,
  },
  heroText: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xl,
    gap: 10,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.clay,
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 39,
    fontWeight: "500",
    color: colors.foreground,
    letterSpacing: -1.4,
    fontFamily: fontFamily.display,
  },
  heroTitleAccent: {
    fontFamily: fontFamily.displayItalic,
    fontWeight: "400",
    color: colors.clayDeep,
  },
  heroSub: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  heroBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  heroBtnText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  sectionHint: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  catTile: {
    alignItems: "center",
    gap: 8,
    width: 72,
  },
  catImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catImage: {
    width: "100%",
    height: "100%",
  },
  catName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.foreground,
    textAlign: "center",
  },
  occChip: {
    // kept for legacy, Shop by Occasion removed
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  occText: { fontSize: 11, fontWeight: "700", color: colors.foreground },
  emptyCatalog: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 4,
  },
  emptyCatalogTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  emptyCatalogSub: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },
  discoverCard: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  discoverHeader: {
    gap: 4,
  },
  discoverEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.clay,
  },
  discoverTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  discoverDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  discoverActions: {
    flexDirection: "row",
    gap: 10,
  },
  discoverBtn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  discoverPrimary: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  discoverPrimaryText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.surface,
    letterSpacing: 0.5,
  },
  discoverSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  discoverSecondaryText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.foreground,
    letterSpacing: 0.5,
  },
});
