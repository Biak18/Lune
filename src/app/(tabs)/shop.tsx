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

function priceToRange(v: string | null): { min?: number; max?: number } {
  if (v === "under60") return { max: 59.99 };
  if (v === "60-80") return { min: 60, max: 80 };
  if (v === "80plus") return { min: 80 };
  return {};
}

export default function ShopScreen() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState("recommended");
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [pendingSort, setPendingSort] = useState(sort);
  const [pendingStyle, setPendingStyle] = useState<string | null>(styleFilter);
  const [pendingOccasion, setPendingOccasion] = useState<string | null>(occasionFilter);
  const [pendingSize, setPendingSize] = useState<string | null>(sizeFilter);
  const [pendingColor, setPendingColor] = useState<string | null>(colorFilter);
  const [pendingPrice, setPendingPrice] = useState<string | null>(priceFilter);
  const [pendingInStock, setPendingInStock] = useState(inStockOnly);
  const [filterVisible, setFilterVisible] = useState(false);

  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();

  const priceRange = priceToRange(priceFilter);
  const query = useProductsInfiniteQuery(
    {
      search: search.trim() || undefined,
      categoryId: categoryId ?? undefined,
      style: styleFilter ?? undefined,
      occasion: occasionFilter ?? undefined,
      size: sizeFilter ?? undefined,
      color: colorFilter ?? undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      inStock: inStockOnly || undefined,
      sort: sort as any,
    },
    10,
  );

  const products = query.data?.pages.flatMap((p) => p.data) ?? [];

  const handleApply = () => {
    setSort(pendingSort);
    setStyleFilter(pendingStyle);
    setOccasionFilter(pendingOccasion);
    setSizeFilter(pendingSize);
    setColorFilter(pendingColor);
    setPriceFilter(pendingPrice);
    setInStockOnly(pendingInStock);
    setFilterVisible(false);
  };

  const handleClear = () => {
    setPendingSort("recommended");
    setPendingStyle(null);
    setPendingOccasion(null);
    setPendingSize(null);
    setPendingColor(null);
    setPendingPrice(null);
    setPendingInStock(false);
    setSort("recommended");
    setStyleFilter(null);
    setOccasionFilter(null);
    setSizeFilter(null);
    setColorFilter(null);
    setPriceFilter(null);
    setInStockOnly(false);
    setFilterVisible(false);
  };

  const openFilter = () => {
    setPendingSort(sort);
    setPendingStyle(styleFilter);
    setPendingOccasion(occasionFilter);
    setPendingSize(sizeFilter);
    setPendingColor(colorFilter);
    setPendingPrice(priceFilter);
    setPendingInStock(inStockOnly);
    setFilterVisible(true);
  };

  const hasActiveFilters =
    !!styleFilter || !!occasionFilter || !!sizeFilter || !!colorFilter || !!priceFilter || inStockOnly || sort !== "recommended";

  return (
    <Screen
      scrollable={false}
      contentStyle={styles.root}
      padded={false}
      centered={false}
    >
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
        {hasActiveFilters && (
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {styleFilter ? <Text style={styles.activeFilter}>Style: {styleFilter}</Text> : null}
            {occasionFilter ? <Text style={styles.activeFilter}>Occasion: {occasionFilter}</Text> : null}
            {sizeFilter ? <Text style={styles.activeFilter}>Size: {sizeFilter}</Text> : null}
            {colorFilter ? <Text style={styles.activeFilter}>Color: {colorFilter}</Text> : null}
            {priceFilter ? <Text style={styles.activeFilter}>Price: {priceFilter}</Text> : null}
            {inStockOnly ? <Text style={styles.activeFilter}>In stock</Text> : null}
            {sort !== "recommended" ? <Text style={styles.activeFilter}>Sort: {sort}</Text> : null}
            <Pressable onPress={handleClear} hitSlop={8}>
              <Text style={[styles.activeFilter, { backgroundColor: colors.foreground, color: colors.surface }]}>Clear all</Text>
            </Pressable>
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
        sizeFilter={pendingSize}
        onSizeChange={setPendingSize}
        colorFilter={pendingColor}
        onColorChange={setPendingColor}
        priceFilter={pendingPrice}
        onPriceChange={setPendingPrice}
        inStockOnly={pendingInStock}
        onInStockChange={setPendingInStock}
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
