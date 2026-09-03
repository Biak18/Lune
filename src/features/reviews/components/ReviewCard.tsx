import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { RatingStars } from "./RatingStars";
import { useAuthStore } from "@/stores/authStore";
import type { Review } from "../services/reviewService";

type Props = {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ReviewCard({ review, onEdit, onDelete }: Props) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === review.user_id;
  const date = new Date(review.created_at).toLocaleDateString();
  const verified = !!review.order_item_id;
  const name = (review as any).profile?.full_name ?? "Customer";

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={{ gap: 4, flex: 1 }}>
          <RatingStars value={review.rating} size={14} />
          <Text style={styles.meta}>
            {name} • {date} {verified ? "• Verified purchase" : ""}
          </Text>
        </View>
        {verified && <Text style={styles.verified}>✓ Verified</Text>}
      </View>
      {review.body ? <Text style={styles.body}>{review.body}</Text> : <Text style={styles.emptyBody}>No written review</Text>}
      {isOwner && (onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.actionBtn}>
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={[styles.actionBtn, styles.deleteBtn]}>
              <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  meta: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  verified: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.success,
    backgroundColor: colors.successBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  body: {
    fontSize: 13,
    color: colors.foreground,
    lineHeight: 18,
  },
  emptyBody: {
    fontSize: 12,
    color: colors.mutedLight,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: colors.errorBackground,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
});
