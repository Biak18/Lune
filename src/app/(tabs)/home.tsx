import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useCategoriesQuery, useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { RecommendationCarousel } from "@/features/recommendations/components/RecommendationCarousel";
import { useRecentlyViewedProducts } from "@/features/recommendations/hooks/useRecommendations";
import { Featured3DCarousel } from "@/features/products/components/Featured3DCarousel";

export default function HomeScreen() {
  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();
  const { data: featured, isLoading: loadingFeat } = useProductsQuery({ style: "elegant", pageSize: 4 });
  const { data: recentProds, isLoading: loadingRecent } = useRecentlyViewedProducts();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
      {/* Header — minimal wordmark + actions */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.wordmark}>LUNE</Text>
          <View style={styles.dot} />
          <Text style={styles.season}>FW 2026</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <NotificationBell size={18} />
          <Pressable onPress={() => router.push("/shop" as any)} hitSlop={8} style={styles.shopLink}>
            <Text style={styles.headerLink}>Shop</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* Hero — immersive editorial */}
      <View style={styles.hero}>
        <Image source={{ uri: "https://picsum.photos/seed/hero-dress/800/900" }} style={StyleSheet.absoluteFill} contentFit="cover" priority="high" cachePolicy="memory-disk" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>New collection — Nobero curation</Text>
          <Text style={styles.heroTitle}>Effortless{"\n"}elegance</Text>
          <Text style={styles.heroSub}>Soft cottons, airy linens, quiet tailoring</Text>
          <Pressable style={styles.heroBtn} onPress={() => router.push("/shop" as any)}>
            <Text style={styles.heroBtnText}>Shop now</Text>
          </Pressable>
        </View>
      </View>

      {/* Categories — image tiles, not chips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <Link href="/shop" asChild>
            <Pressable hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </Link>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: spacing.xl }} showsVerticalScrollIndicator={false}>
            {categories?.map((c) => (
              <Link key={c.id} href={`/category/${c.id}` as any} asChild>
                <Pressable style={styles.catTile} accessibilityLabel={c.name}>
                  <View style={styles.catImageWrap}>
                    <Image source={{ uri: c.image_url ?? "https://picsum.photos/seed/cat/200/200" }} style={styles.catImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                  </View>
                  <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Featured — 3D carousel (from youtube k2ax0t4dYAY) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <Text style={styles.sectionHint}>Elegant edit • 3D</Text>
        </View>
        {loadingFeat ? (
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {[1, 2].map((i) => (
              <View key={i} style={{ flex: 1, gap: 8 }}>
                <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
                <Skeleton style={{ height: 12, width: "60%" }} />
              </View>
            ))}
          </View>
        ) : (
          <Featured3DCarousel products={featured?.data.slice(0, 6) ?? []} />
        )}
      </View>

      {/* Discover — single editorial card combining Style Finder + AI */}
      <View style={styles.discoverCard}>
        <View style={styles.discoverHeader}>
          <Text style={styles.discoverEyebrow}>Discover</Text>
          <Text style={styles.discoverTitle}>Find your perfect piece</Text>
          <Text style={styles.discoverDesc}>Answer 2 questions or chat with our stylist — same curated catalog, no AI required.</Text>
        </View>
        <View style={styles.discoverActions}>
          <Pressable style={[styles.discoverBtn, styles.discoverPrimary]} onPress={() => router.push("/style-finder" as any)}>
            <Ionicons name="color-palette-outline" size={14} color={colors.surface} />
            <Text style={styles.discoverPrimaryText}>Style Finder</Text>
          </Pressable>
          <Pressable style={[styles.discoverBtn, styles.discoverSecondary]} onPress={() => router.push("/assistant" as any)}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.foreground} />
            <Text style={styles.discoverSecondaryText}>AI Stylist</Text>
          </Pressable>
        </View>
      </View>

      {/* Occasion — quiet pills */}

      {recentProds && recentProds.length > 0 && (
        <RecommendationCarousel title="Recently viewed" subtitle="Pick up where you left off" products={recentProds} isLoading={loadingRecent} onSeeAll={() => router.push("/(tabs)/shop" as any)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: 28,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
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
  shopLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerLink: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  hero: {
    height: 420,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(42,27,22,0.14)",
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
    color: colors.paper,
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 34,
    fontWeight: "600",
    color: colors.paper,
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 12,
    color: colors.paper,
    opacity: 0.85,
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
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.2,
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
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  occText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: 0.2,
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