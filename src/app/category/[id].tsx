import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { useCategoriesQuery, useProductsInfiniteQuery } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: categories } = useCategoriesQuery();
  const category = categories?.find((c) => c.id === id);
  const query = useProductsInfiniteQuery({ categoryId: id }, 10);
  const products = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>{category?.name ?? "Category"}</Text>
      {category?.description ? <Text style={styles.desc}>{category.description}</Text> : null}
      <View style={styles.list}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: 12,
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
});
