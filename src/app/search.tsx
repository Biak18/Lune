import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { SearchInput } from "@/features/products/components/SearchInput";
import { useProductsInfiniteQuery } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const query = useProductsInfiniteQuery({ search: q.trim() || undefined }, 10);
  const products = query.data?.pages.flatMap((p) => p.data) ?? [];
  const hasSearched = q.trim().length > 0;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={{ padding: spacing.xl, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.title}>Search</Text>
          <Text onPress={() => router.back()} style={styles.cancel}>
            Cancel
          </Text>
        </View>
        <SearchInput value={q} onChangeText={setQ} onClear={() => setQ("")} />
        {!hasSearched ? (
          <Text style={styles.hint}>Try “satin”, “linen” or “velvet”.</Text>
        ) : null}
      </View>
      <View style={styles.list}>
        {!hasSearched ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Discover dresses</Text>
            <Text style={styles.emptySub}>Search by name, style or occasion.</Text>
          </View>
        ) : (
          <ProductGrid
            products={products}
            isLoading={query.isLoading}
            isError={query.isError}
            errorMessage={query.error ? String((query.error as Error).message) : undefined}
            onRetry={() => query.refetch()}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
  },
  cancel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.clayDeep,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  center: {
    paddingTop: spacing["3xl"],
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
  },
});
