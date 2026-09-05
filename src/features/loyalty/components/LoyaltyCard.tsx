import { View, Text, Pressable, StyleSheet, Share } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { loyaltyService } from "../services/loyaltyService";
import type { LoyaltyAccount } from "../services/loyaltyService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type Props = {
  account: LoyaltyAccount | null | undefined;
  isLoading?: boolean;
};

const tierColor: Record<string, string> = {
  bronze: "#8D6E63",
  silver: "#90A4AE",
  gold: colors.gold,
  platinum: "#6A1B9A",
};

export function LoyaltyCard({ account, isLoading }: Props) {
  const points = account?.points ?? 0;
  const tier = (account?.tier ?? "bronze") as string;
  const threshold = loyaltyService.tierThresholds as any;
  const currentTh = threshold[tier] ?? 0;
  const nextTier = tier === "bronze" ? "silver" : tier === "silver" ? "gold" : tier === "gold" ? "platinum" : null;
  const nextTh = nextTier ? threshold[nextTier] : null;
  const progress = nextTh ? Math.min(1, Math.max(0, (points - currentTh) / (nextTh - currentTh))) : 1;

  const handleShare = async () => {
    const code = account?.referral_code ?? "LUNE";
    try {
      await Haptics.selectionAsync();
    } catch {}
    try {
      await Share.share({ message: `Join LUNE with my code ${code} — earn 100 points!` });
    } catch {}
  };

  if (isLoading) {
    return (
      <View style={[styles.card, { height: 140, backgroundColor: colors.surfaceMuted }]} />
    );
  }

  return (
    <View style={[styles.card, { borderColor: tierColor[tier] ?? colors.border }]}>
      <View style={styles.top}>
        <View>
          <Text style={styles.eyebrow}>Loyalty • {tier.toUpperCase()}</Text>
          <Text style={styles.points}>{points} pts</Text>
          <Text style={styles.hint}>1 point per $1 • Earn on every order</Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: tierColor[tier] }]}>
          <Ionicons name="star" size={12} color={colors.surface} />
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: tierColor[tier] }]} />
        </View>
        <Text style={styles.progressText}>
          {nextTier ? `${points - currentTh}/${(nextTh ?? 0) - currentTh} to ${nextTier}` : "Top tier — platinum"}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.referLabel}>Referral code</Text>
          <Text style={styles.referCode}>{account?.referral_code ?? "—"}</Text>
        </View>
        <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={8}>
          <Ionicons name="share-outline" size={14} color={colors.foreground} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    gap: 12,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.clay,
  },
  points: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.foreground,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
  },
  tierText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.surface,
    textTransform: "capitalize",
  },
  progressWrap: {
    gap: 6,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  referLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  referCode: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.foreground,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  shareText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foreground,
  },
});
