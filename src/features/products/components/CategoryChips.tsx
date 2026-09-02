import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import type { Category } from "../types";

type Props = {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
};

export function CategoryChips({ categories, selectedId, onSelect, isLoading }: Props) {
  if (isLoading) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={{ marginHorizontal: -24 }}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, !selectedId && styles.chipActive]}
      >
        <Text style={[styles.text, !selectedId && styles.textActive]}>All</Text>
      </Pressable>
      {categories.map((c) => {
        const active = selectedId === c.id;
        return (
          <Pressable key={c.id} onPress={() => onSelect(c.id)} style={[styles.chip, active && styles.chipActive]}>
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
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
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
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  textActive: {
    color: colors.surface,
  },
});
