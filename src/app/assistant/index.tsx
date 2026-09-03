import { useState, useRef, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import { ProductCard } from "@/features/products/components/ProductCard";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";

type Msg = { id: string; role: "assistant" | "user"; text: string; chips?: string[]; products?: boolean };

const OCCASIONS = ["everyday", "office", "vacation", "casual", "party", "wedding"];
const STYLES = ["minimal", "elegant", "casual", "bold", "romantic"];
const COLORS = ["Black", "White", "Navy", "Beige", "Olive", "Gray"];

function parseFreeText(input: string) {
  const low = input.toLowerCase();
  const occ = OCCASIONS.find((o) => low.includes(o));
  const sty = STYLES.find((s) => low.includes(s));
  const col = COLORS.find((c) => low.includes(c.toLowerCase()));
  return { occ, sty, col };
}

export default function AssistantScreen() {
  const [occasion, setOccasion] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [colorPref, setColorPref] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", text: "Hi! I'm your fashion assistant. What occasion are you shopping for?", chips: OCCASIONS },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  const queryEnabled = step === 3 && !!occasion && !!style;
  const { data: result, isLoading } = useProductsQuery(queryEnabled ? { occasion: occasion!, style: style!, pageSize: 8 } : { pageSize: 1 });
  const products = useMemo(() => {
    if (!queryEnabled) return [];
    let list = result?.data ?? [];
    if (colorPref) {
      const filtered = list.filter((p) => p.variants.some((v) => v.color?.toLowerCase() === colorPref.toLowerCase() && v.is_active && (v.stock_quantity ?? 0) > 0));
      if (filtered.length) list = filtered;
    }
    return list;
  }, [queryEnabled, result, colorPref]);

  const push = (msg: Msg) => setMessages((m) => [...m, msg]);

  const handleOccasion = async (o: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setOccasion(o);
    push({ id: `u-${Date.now()}`, role: "user", text: o });
    setStep(1);
    setTimeout(() => push({ id: `a-${Date.now()}`, role: "assistant", text: `Lovely — ${o} vibes. What style do you prefer?`, chips: STYLES }), 300);
  };

  const handleStyle = async (s: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setStyle(s);
    push({ id: `u-${Date.now()}`, role: "user", text: s });
    setStep(2);
    setTimeout(() => push({ id: `a-${Date.now()}`, role: "assistant", text: "Any color preference? Or skip.", chips: [...COLORS, "Skip"] }), 300);
  };

  const handleColor = async (c: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    const isSkip = c.toLowerCase() === "skip";
    const col = isSkip ? null : c;
    setColorPref(col);
    push({ id: `u-${Date.now()}`, role: "user", text: isSkip ? "No preference" : c });
    setStep(3);
    setTimeout(
      () =>
        push({
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Perfect — curated for ${occasion} • ${style}${col ? ` • ${col}` : ""}. Here are my picks.`,
          products: true,
        }),
      400
    );
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { occ, sty, col } = parseFreeText(trimmed);
    push({ id: `u-${Date.now()}`, role: "user", text: trimmed });
    setInput("");
    if (occ) setOccasion(occ);
    if (sty) setStyle(sty);
    if (col) setColorPref(col);
    if (occ && sty) {
      setStep(3);
      setTimeout(() => push({ id: `a-${Date.now()}`, role: "assistant", text: `Got it — ${occ} • ${sty}${col ? ` • ${col}` : ""}. Here are my picks.`, products: true }), 300);
    } else {
      setTimeout(
        () => push({ id: `a-${Date.now()}`, role: "assistant", text: "Tell me occasion (everyday/office/vacation/party) and style (minimal/elegant/casual/bold). Try chips below.", chips: OCCASIONS }),
        300
      );
    }
    try {
      await Haptics.selectionAsync();
    } catch {}
  };

  const handleReset = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setOccasion(null);
    setStyle(null);
    setColorPref(null);
    setStep(0);
    setMessages([{ id: "m0", role: "assistant", text: "Hi! I'm your fashion assistant. What occasion are you shopping for?", chips: OCCASIONS }]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>AI Fashion Assistant</Text>
        <Text style={styles.sub}>Deterministic • No AI required for core commerce</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.role === "user" ? styles.rowUser : styles.rowAssistant]}>
              <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant]}>
                <Text style={[styles.bubbleText, m.role === "user" ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>{m.text}</Text>
              </View>
              {m.chips && (
                <View style={styles.chips}>
                  {m.chips.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => {
                        if (step === 0) handleOccasion(c.toLowerCase());
                        else if (step === 1) handleStyle(c.toLowerCase());
                        else if (step === 2) handleColor(c);
                        else handleOccasion(c.toLowerCase());
                      }}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {m.products && (
                <View style={styles.productsWrap}>
                  {isLoading ? (
                    <Text style={styles.hint}>Curating…</Text>
                  ) : products.length === 0 ? (
                    <View style={styles.empty}>
                      <Text style={styles.emptyTitle}>No exact match</Text>
                      <Text style={styles.hint}>Try different occasion/style.</Text>
                    </View>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: spacing.xl }}>
                      {products.map((p) => (
                        <View key={p.id} style={{ width: 160 }}>
                          <ProductCard product={p} />
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <Button title="Refine" variant="secondary" onPress={handleReset} style={{ flex: 1 }} />
                    <Button title="Shop all" onPress={() => router.push("/(tabs)/shop" as any)} style={{ flex: 1 }} />
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask: I need a dress for a wedding"
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            accessibilityLabel="Ask assistant"
          />
          <Pressable onPress={handleSend} style={styles.send} accessibilityRole="button" accessibilityLabel="Send">
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
          <Pressable onPress={handleReset} style={styles.reset} accessibilityLabel="Reset">
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    backgroundColor: colors.background,
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
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    marginTop: 4,
  },
  sub: {
    fontSize: 11,
    color: colors.muted,
  },
  messages: {
    padding: spacing.xl,
    gap: 14,
    paddingBottom: 24,
  },
  bubbleRow: {
    gap: 8,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  rowAssistant: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextAssistant: {
    color: colors.foreground,
  },
  bubbleTextUser: {
    color: colors.surface,
    fontWeight: "600",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
    textTransform: "capitalize",
  },
  productsWrap: {
    marginTop: 8,
    gap: 8,
    width: "100%",
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
  },
  empty: {
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.foreground,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.foreground,
  },
  send: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.surface,
  },
  reset: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
});
