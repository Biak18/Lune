import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";

const OCCASIONS = [
  { id: "everyday", label: "Everyday", desc: "Daily essentials" },
  { id: "office", label: "Office", desc: "Work-ready" },
  { id: "vacation", label: "Vacation", desc: "Light & breezy" },
  { id: "casual", label: "Casual", desc: "Weekend ease" },
  { id: "party", label: "Party", desc: "Stand out" },
  { id: "wedding", label: "Wedding", desc: "Elegant moments" },
] as const;

const STYLES = [
  { id: "minimal", label: "Minimal", desc: "Clean & quiet" },
  { id: "elegant", label: "Elegant", desc: "Refined" },
  { id: "casual", label: "Casual", desc: "Relaxed" },
  { id: "bold", label: "Bold", desc: "Statement" },
  { id: "romantic", label: "Romantic", desc: "Soft & dreamy" },
] as const;

export default function StyleFinderScreen() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);

  const queryEnabled = step === 2 && !!occasion && !!style;
  const { data: result, isLoading, isError, error, refetch } = useProductsQuery(
    queryEnabled ? { occasion: occasion!, style: style!, pageSize: 12 } : { pageSize: 1 }
  );

  const products = queryEnabled ? result?.data ?? [] : [];

  const canNextOccasion = !!occasion;
  const canNextStyle = !!style;

  const handleOccasionSelect = async (id: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setOccasion(id);
  };
  const handleStyleSelect = async (id: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setStyle(id);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <Pressable onPress={() => (step === 0 ? router.back() : setStep((s) => (s === 2 ? 1 : 0) as any))} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
          <Text style={styles.backText}>← {step === 0 ? "Back" : "Previous"}</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Style Finder</Text>
          <Text style={styles.title}>
            {step === 0 ? "Where will you wear it?" : step === 1 ? "What's your style?" : "Your matches"}
          </Text>
          <Text style={styles.desc}>
            {step === 0
              ? "Choose an occasion — we'll match dresses and co-ords by metadata."
              : step === 1
                ? "Pick a style vibe. This filters products by style + occasion deterministically (no AI)."
                : `Occasion: ${occasion} • Style: ${style}`}
          </Text>
          <View style={styles.steps}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
            ))}
            <Text style={styles.stepLabel}>Step {step + 1} of 3</Text>
          </View>
        </View>

        {step === 0 && (
          <View style={styles.grid}>
            {OCCASIONS.map((o) => {
              const active = occasion === o.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => handleOccasionSelect(o.id)}
                  style={[styles.choice, active && styles.choiceActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{o.label}</Text>
                  <Text style={[styles.choiceDesc, active && styles.choiceDescActive]}>{o.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 1 && (
          <View style={styles.grid}>
            {STYLES.map((s) => {
              const active = style === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => handleStyleSelect(s.id)}
                  style={[styles.choice, active && styles.choiceActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{s.label}</Text>
                  <Text style={[styles.choiceDesc, active && styles.choiceDescActive]}>{s.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 16 }}>
            <View style={styles.chosenRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{occasion}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{style}</Text>
              </View>
              <Pressable onPress={() => setStep(0)} style={styles.editBtn}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>

            {isLoading ? (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {[1, 2].map((i) => (
                    <View key={`s-${i}`} style={{ flex: 1, gap: 8 }}>
                      <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
                      <Skeleton style={{ height: 12, width: "70%" }} />
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {[3, 4].map((i) => (
                    <View key={`s-${i}`} style={{ flex: 1, gap: 8 }}>
                      <Skeleton style={{ aspectRatio: 0.78, borderRadius: radius.lg }} />
                      <Skeleton style={{ height: 12, width: "70%" }} />
                    </View>
                  ))}
                </View>
              </View>
            ) : isError ? (
              <View style={styles.center}>
                <Text style={styles.errorTitle}>We couldn&apos;t load matches.</Text>
                <Text style={styles.desc}>{String((error as Error)?.message ?? "Try again")}</Text>
                <Button title="Retry" onPress={() => refetch()} style={{ marginTop: 8 }} />
              </View>
            ) : products.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyTitle}>No exact match</Text>
                <Text style={styles.desc}>No products match {occasion} + {style}. Try another pair — our catalog is curated around Nobero essentials.</Text>
                <Button title="Try different style" variant="secondary" onPress={() => setStep(1)} style={{ marginTop: 12 }} />
                <Button title="Browse all" onPress={() => router.push("/(tabs)/shop" as any)} style={{ marginTop: 8 }} />
              </View>
            ) : (
              <>
                <Text style={styles.resultCount}>{products.length} matches • Deterministic filter</Text>
                <FlatList
                  data={products}
                  keyExtractor={(p) => p.id}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={{ gap: 12 }}
                  contentContainerStyle={{ gap: 12 }}
                  renderItem={({ item }) => (
                    <View style={{ flex: 1 }}>
                      <ProductCard product={item} />
                    </View>
                  )}
                 showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
                <Button title="Refine choices" variant="secondary" onPress={() => setStep(0)} />
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 0 && <Button title={canNextOccasion ? "Continue to style" : "Select occasion"} disabled={!canNextOccasion} onPress={() => setStep(1)} />}
        {step === 1 && <Button title={canNextStyle ? "See matches" : "Select style"} disabled={!canNextStyle} onPress={() => setStep(2)} />}
        {step === 2 && (
          <Button
            title="Start over"
            variant="secondary"
            onPress={() => {
              setOccasion(null);
              setStyle(null);
              setStep(0);
            }}
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
  scroll: {
    padding: spacing.xl,
    gap: 20,
    paddingBottom: 32,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.clay,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  stepDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.foreground,
  },
  stepLabel: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choice: {
    minWidth: "47%",
    flex: 1,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  choiceActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
  },
  choiceLabelActive: {
    color: colors.surface,
  },
  choiceDesc: {
    fontSize: 11,
    color: colors.muted,
  },
  choiceDescActive: {
    color: colors.surface,
    opacity: 0.8,
  },
  chosenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
    textTransform: "capitalize",
  },
  editBtn: {
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  resultCount: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  center: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.foreground,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
