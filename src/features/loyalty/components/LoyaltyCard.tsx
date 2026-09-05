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
        await Share.share({ message: `Join LUNE with my code ${code} earn 100 points` });
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
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Membership {tier.toUpperCase()}</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 }}>
            <Text style={styles.points}>{points}</Text>
            <Text style={styles.pointsSub}>pts</Text>
          </View>
          <Text style={styles.hint}>1 pt per $1</Text>
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
          {nextTier ? `${points - currentTh} / ${(nextTh ?? 0) - currentTh} to ${nextTier}` : "Platinum top tier"}
        </Text>
      </View>

      <View style={styles.referRow}>
        <Text style={styles.referLabel}>Code</Text>
        <Text style={styles.referCode}>{account?.referral_code ?? "-"}</Text>
        <Pressable onPress={handleShare} style={styles.shareChip} hitSlop={8}>
          <Ionicons name="share-outline" size={12} color={colors.foreground} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    gap: 10,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: colors.clay },
  points: { fontSize: 26, fontWeight: "800", color: colors.foreground, letterSpacing: -0.6 },
  pointsSub: { fontSize: 12, fontWeight: "600", color: colors.muted },
  hint: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tierBadge: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 10, height: 26, borderRadius: 999 },
  tierText: { fontSize: 11, fontWeight: "800", color: colors.surface, textTransform: "capitalize" },
  progressWrap: { gap: 5 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 10, color: colors.mutedLight, fontWeight: "600" },
  referRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 2 },
  referLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: colors.muted },
  referCode: { fontSize: 12, fontWeight: "800", letterSpacing: 1, color: colors.foreground, flex: 1 },
  shareChip: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 10, height: 28, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  shareText: { fontSize: 10, fontWeight: "700", color: colors.foreground },
});
