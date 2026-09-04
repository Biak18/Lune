import { ScrollView, Pressable, Text, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
};

const iconForSlug: Record<string, keyof typeof Ionicons.glyphMap> = {
  "t-shirts": "shirt-outline",
  shirts: "shirt-outline",
  hoodies: "snow-outline",
  pants: "cut-outline",
  joggers: "walk-outline",
  shorts: "sunny-outline",
  polos: "pricetag-outline",
  "co-ord-sets": "apps-outline",
};

export function CategoryChips({ categories, selectedId, onSelect, isLoading }: Props) {
  if (isLoading) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={{ marginHorizontal: -24 }} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.chip, { width: 90, opacity: 0.6 }]} />
        ))}
      </ScrollView>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={{ marginHorizontal: -24 }} showsVerticalScrollIndicator={false}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, !selectedId && styles.chipActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: !selectedId }}
      >
        <Ionicons name="apps-outline" size={14} color={!selectedId ? colors.surface : colors.foreground} />
        <Text style={[styles.text, !selectedId && styles.textActive]}>All</Text>
      </Pressable>
      {categories.map((c) => {
        const active = selectedId === c.id;
        const fallback = iconForSlug[c.slug] ?? "pricetag-outline";
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={c.name}
          >
            {c.image_url ? (
              <Image source={{ uri: c.image_url }} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" transition={200} />
            ) : (
              <Ionicons name={fallback} size={14} color={active ? colors.surface : colors.foreground} />
            )}
            <Text style={[styles.text, active && styles.textActive]}>{c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 4,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  textActive: {
    color: colors.surface,
  },
});
