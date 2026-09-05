import { View, ActivityIndicator, Text, StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProductWithRelations } from "../types";
import { router } from "expo-router";

type Props = {
  products?: ProductWithRelations[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
};

export function ProductGrid({
  products,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onEndReached,
  isFetchingNextPage,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.skeletonCard}>
            <Skeleton style={{ aspectRatio: 0.78, borderRadius: 14 }} />
            <Skeleton style={{ height: 12, width: "70%" }} />
            <Skeleton style={{ height: 12, width: "40%" }} />
          </View>
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>We couldn&apos;t load the dresses.</Text>
        <Text style={styles.errorSub}>Check your connection and try again.</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        ) : null}
        {errorMessage ? <Text style={styles.errorMsg}>{errorMessage}</Text> : null}
      </View>
    );
  }

  if (!products || products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No dresses found.</Text>
        <Text style={styles.emptySub}>Try another search or explore our collections.</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/shop" as any)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Browse collections"
          style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.browseText}>Browse Collections</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlashList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <View style={{ flex: 1, padding: spacing.lg / 2 }}>
          <ProductCard product={item} />
        </View>
      )}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ padding: spacing.lg, alignItems: "center" }}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : null
      }
     showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  skeletonCard: {
    width: "47%",
    gap: 8,
  },
  center: {
    paddingVertical: spacing["3xl"],
    alignItems: "center",
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
    textAlign: "center",
  },
  retry: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: colors.clay,
    textDecorationLine: "underline",
  },
  browseBtn: {
    marginTop: 12,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  browseText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.surface,
  },
  errorMsg: {
    fontSize: 12,
    color: colors.error,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
});
