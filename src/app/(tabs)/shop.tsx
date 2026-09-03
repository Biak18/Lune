import { Screen } from "@/components/ui/Screen";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { CategoryChips } from "@/features/products/components/CategoryChips";
import { FilterSheet } from "@/features/products/components/FilterSheet";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { SearchInput } from "@/features/products/components/SearchInput";
import {
  useCategoriesQuery,
  useProductsInfiniteQuery,
} from "@/features/products/hooks/useProducts";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ShopScreen() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState("recommended");
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);
  const [pendingSort, setPendingSort] = useState(sort);
  const [pendingStyle, setPendingStyle] = useState<string | null>(styleFilter);
  const [pendingOccasion, setPendingOccasion] = useState<string | null>(
    occasionFilter,
  );
  const [filterVisible, setFilterVisible] = useState(false);

  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();

  const query = useProductsInfiniteQuery(
    {
      search: search.trim() || undefined,
      categoryId: categoryId ?? undefined,
      style: styleFilter ?? undefined,
      occasion: occasionFilter ?? undefined,
      sort: sort as any,
    },
    10,
  );

  const products = query.data?.pages.flatMap((p) => p.data) ?? [];

  const handleApply = () => {
    setSort(pendingSort);
    setStyleFilter(pendingStyle);
    setOccasionFilter(pendingOccasion);
    setFilterVisible(false);
  };

  const handleClear = () => {
    setPendingSort("recommended");
    setPendingStyle(null);
    setPendingOccasion(null);
    setSort("recommended");
    setStyleFilter(null);
    setOccasionFilter(null);
    setFilterVisible(false);
  };

  const openFilter = () => {
    setPendingSort(sort);
    setPendingStyle(styleFilter);
    setPendingOccasion(occasionFilter);
    setFilterVisible(true);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Pressable onPress={openFilter} style={styles.filterBtn}>
          <Text style={styles.filterText}>Filters</Text>
        </Pressable>
      </View>

      <View
        style={{ paddingHorizontal: spacing.xl, gap: 12, paddingBottom: 12 }}
      >
        <SearchInput
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch("")}
          onSubmit={() => query.refetch()}
        />
        <CategoryChips
          categories={categories ?? []}
          selectedId={categoryId}
          onSelect={setCategoryId}
          isLoading={catsLoading}
        />
        {(styleFilter || occasionFilter || sort !== "recommended") && (
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {styleFilter ? (
              <Text style={styles.activeFilter}>Style: {styleFilter}</Text>
            ) : null}
            {occasionFilter ? (
              <Text style={styles.activeFilter}>
                Occasion: {occasionFilter}
              </Text>
            ) : null}
            {sort !== "recommended" ? (
              <Text style={styles.activeFilter}>Sort: {sort}</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.listWrap}>
        <ProductGrid
          products={products}
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={
            query.error ? String((query.error as Error).message) : undefined
          }
          onRetry={() => query.refetch()}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage)
              query.fetchNextPage();
          }}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </View>

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        sort={pendingSort}
        onSortChange={setPendingSort}
        styleFilter={pendingStyle}
        onStyleChange={setPendingStyle}
        occasionFilter={pendingOccasion}
        onOccasionChange={setPendingOccasion}
        onApply={handleApply}
        onClear={handleClear}
      />
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
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  filterBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  activeFilter: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.clayDeep,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
