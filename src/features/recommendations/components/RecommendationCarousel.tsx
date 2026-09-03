import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProductWithRelations } from "@/features/products/types";

type Props = {
  title: string;
  subtitle?: string;
  products?: ProductWithRelations[];
  isLoading?: boolean;
  onSeeAll?: () => void;
  emptyText?: string;
};

export function RecommendationCarousel({ title, subtitle, products, isLoading, onSeeAll, emptyText }: Props) {
  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ width: 160, gap: 8 }}>
              <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
              <Skeleton style={{ height: 12, width: "70%" }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!products || products.length === 0) {
    if (emptyText) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.empty}>{emptyText}</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: spacing.xl }}>
        {products.map((p) => (
          <View key={p.id} style={{ width: 160 }}>
            <ProductCard product={p} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.clayDeep,
    textDecorationLine: "underline",
  },
  empty: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: "italic",
  },
});
