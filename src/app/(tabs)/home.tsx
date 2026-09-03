import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useCategoriesQuery, useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { RecommendationCarousel } from "@/features/recommendations/components/RecommendationCarousel";
import { useRecentlyViewedProducts } from "@/features/recommendations/hooks/useRecommendations";

export default function HomeScreen() {
  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();
  const { data: newArrivals, isLoading: loadingNew } = useProductsQuery({ categorySlug: "new-arrivals", pageSize: 4, sort: "newest" });
  const { data: featured, isLoading: loadingFeat } = useProductsQuery({ style: "elegant", pageSize: 4 });
  const { data: recentProds, isLoading: loadingRecent } = useRecentlyViewedProducts();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={styles.wordmark}>MUSE <Text style={{ color: colors.clay }}>/ 09</Text></Text>
          <NotificationBell size={18} />
        </View>
        <Pressable onPress={() => router.push("/shop" as any)}>
          <Text style={styles.headerLink}>Shop all</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: "https://picsum.photos/seed/hero-dress/800/900" }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>New collection</Text>
          <Text style={styles.heroTitle}>Effortless{"\n"}elegance</Text>
          <Pressable style={styles.heroBtn} onPress={() => router.push("/shop" as any)}>
            <Text style={styles.heroBtnText}>Shop now</Text>
          </Pressable>
        </View>
      </View>

      {/* Categories */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {catsLoading ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ width: 90, height: 34, borderRadius: 999 }} />
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories?.map((c) => (
              <Link key={c.id} href={`/category/${c.id}` as any} asChild>
                <Pressable style={styles.catChip}>
                  <Text style={styles.catText}>{c.name}</Text>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        )}
      </View>

      {/* New Arrivals */}
      <View style={{ gap: 12 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <Link href={"/shop" as any} asChild>
            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </Link>
        </View>
        {loadingNew ? (
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {[1, 2].map((i) => (
              <View key={i} style={{ flex: 1, gap: 8 }}>
                <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
                <Skeleton style={{ height: 12, width: "60%" }} />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {newArrivals?.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Featured */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Featured Collection</Text>
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
          <View style={{ flexDirection: "row", gap: spacing.lg }}>
            {featured?.data.slice(0, 2).map((p) => (
              <View key={p.id} style={{ flex: 1 }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Style Finder */}
      <View style={styles.finderCard}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.finderEyebrow}>Style Finder</Text>
          <Text style={styles.finderTitle}>Find your match</Text>
          <Text style={styles.finderDesc}>Occasion → Style → Curated picks (no AI, just metadata)</Text>
        </View>
        <Pressable style={styles.finderBtn} onPress={() => router.push("/style-finder" as any)}>
          <Text style={styles.finderBtnText}>Try it</Text>
        </Pressable>
      </View>

      {/* AI Assistant */}
      <View style={[styles.finderCard, { backgroundColor: colors.foreground, borderColor: colors.foreground }]}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.finderEyebrow, { color: colors.gold }]}>AI Assistant</Text>
          <Text style={[styles.finderTitle, { color: colors.surface }]}>Chat with stylist</Text>
          <Text style={[styles.finderDesc, { color: colors.surface, opacity: 0.8 }]}>“I need a dress for a wedding” → curated picks</Text>
        </View>
        <Pressable style={[styles.finderBtn, { backgroundColor: colors.surface }]} onPress={() => router.push("/assistant" as any)}>
          <Text style={[styles.finderBtnText, { color: colors.foreground }]}>Chat</Text>
        </Pressable>
      </View>

      {/* Shop by Occasion */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Shop by Occasion</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["Party", "Office", "Vacation", "Wedding"].map((o) => (
            <Pressable
              key={o}
              onPress={() => router.push({ pathname: "/shop", params: { occasion: o.toLowerCase() } } as any)}
              style={styles.occChip}
            >
              <Text style={styles.occText}>{o}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {recentProds && recentProds.length > 0 && (
        <RecommendationCarousel
          title="Recently viewed"
          subtitle="Pick up where you left off"
          products={recentProds}
          isLoading={loadingRecent}
          onSeeAll={() => router.push("/(tabs)/shop" as any)}
        />
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
    gap: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  wordmark: {
    fontSize: 13,
    letterSpacing: 2.08,
    fontWeight: "800",
    color: colors.foreground,
  },
  headerLink: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.clayDeep,
  },
  hero: {
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.clay,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(42,27,22,0.22)",
  },
  heroText: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xl,
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.paper,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 32,
    fontWeight: "600",
    color: colors.paper,
    letterSpacing: -0.8,
  },
  heroBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  heroBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  catChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  catText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  occChip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  occText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.foreground,
  },
  finderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finderEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.clay,
  },
  finderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  finderDesc: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  finderBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  finderBtnText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.surface,
  },
});
