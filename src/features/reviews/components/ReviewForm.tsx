import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { RatingStars } from "./RatingStars";
import { Button } from "@/components/ui/Button";

type Props = {
  initialRating?: number;
  initialBody?: string;
  submitting?: boolean;
  onSubmit: (args: { rating: number; body?: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function ReviewForm({ initialRating = 0, initialBody = "", submitting, onSubmit, onCancel, submitLabel = "Submit review" }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);

  const canSubmit = rating >= 1 && rating <= 5;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your rating</Text>
      <RatingStars value={rating} size={24} interactive onChange={setRating} />
      {!canSubmit && <Text style={styles.hint}>Select 1–5 stars</Text>}
      <Text style={styles.label}>Review (optional)</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share your fit, quality, and comfort…"
        placeholderTextColor={colors.mutedLight}
        multiline
        numberOfLines={4}
        style={styles.input}
        accessibilityLabel="Review body"
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button title={submitting ? "Saving…" : submitLabel} onPress={() => onSubmit({ rating, body })} disabled={!canSubmit || !!submitting} loading={!!submitting} />
        </View>
        {onCancel && (
          <Button title="Cancel" variant="secondary" onPress={onCancel} disabled={!!submitting} style={{ flex: 0 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.foreground,
    backgroundColor: colors.surfaceMuted,
    textAlignVertical: "top",
  },
});
