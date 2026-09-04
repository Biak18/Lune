import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { Button } from "@/components/ui/Button";

type Props = {
  visible: boolean;
  onClose: () => void;
  sort: string;
  onSortChange: (v: string) => void;
  styleFilter: string | null;
  onStyleChange: (v: string | null) => void;
  occasionFilter: string | null;
  onOccasionChange: (v: string | null) => void;
  onApply: () => void;
  onClear: () => void;
};

const sorts = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const styleOptions = [
  { label: "All", value: null },
  { label: "Minimal", value: "minimal" },
  { label: "Elegant", value: "elegant" },
  { label: "Romantic", value: "romantic" },
];

const occasions = [
  { label: "All", value: null },
  { label: "Party", value: "party" },
  { label: "Office", value: "office" },
  { label: "Vacation", value: "vacation" },
];

export function FilterSheet({
  visible,
  onClose,
  sort,
  onSortChange,
  styleFilter,
  onStyleChange,
  occasionFilter,
  onOccasionChange,
  onApply,
  onClear,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filters</Text>
          <ScrollView contentContainerStyle={{ gap: spacing.lg }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              <Text style={styles.section}>Sort</Text>
              <View style={styles.chips}>
                {sorts.map((s) => (
                  <Pressable key={s.value} onPress={() => onSortChange(s.value)} style={[styles.chip, sort === s.value && styles.chipActive]}>
                    <Text style={[styles.chipText, sort === s.value && styles.chipTextActive]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.section}>Style</Text>
              <View style={styles.chips}>
                {styleOptions.map((s) => (
                  <Pressable key={String(s.value)} onPress={() => onStyleChange(s.value)} style={[styles.chip, styleFilter === s.value && styles.chipActive]}>
                    <Text style={[styles.chipText, styleFilter === s.value && styles.chipTextActive]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.section}>Occasion</Text>
              <View style={styles.chips}>
                {occasions.map((o) => (
                  <Pressable key={String(o.value)} onPress={() => onOccasionChange(o.value)} style={[styles.chip, occasionFilter === o.value && styles.chipActive]}>
                    <Text style={[styles.chipText, occasionFilter === o.value && styles.chipTextActive]}>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Button title="Clear" variant="secondary" onPress={onClear} style={{ flex: 1 }} />
            <Button title="Apply" onPress={onApply} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const stylesSheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(42,27,22,0.35)",
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    gap: spacing.lg,
    maxHeight: "78%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  section: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.surface,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: spacing.md,
  },
});

const styles = stylesSheet;
