import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { useRedeem, useLoyaltyPending } from "../hooks/useLoyalty";
import * as Haptics from "expo-haptics";

type Reward = { points: number; title: string; desc: string };

const REWARDS: Reward[] = [
  { points: 200, title: "$10 off", desc: "200 pts next order" },
  { points: 400, title: "$25 off", desc: "400 pts next order" },
  { points: 800, title: "Free shipping year", desc: "800 pts 12 months" },
];

export function RewardsList({ currentPoints }: { currentPoints: number }) {
  const redeem = useRedeem();
  const { data: pending } = useLoyaltyPending();
  const hasPending = (pending?.amount ?? 0) > 0 || !!pending?.freeShipping;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Rewards</Text>
      {hasPending ? (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>Pending {pending?.freeShipping ? "Free shipping" : `$${pending?.amount} off`} next order</Text>
        </View>
      ) : null}
      {redeem.isSuccess ? <Text style={styles.success}>Redeemed discount applies at checkout</Text> : null}
      <View style={styles.grid}>
        {REWARDS.map((r) => {
          const can = currentPoints >= r.points;
          return (
            <View key={r.points} style={[styles.card, !can && { opacity: 0.55 }]}>
              <Text style={styles.pts}>{r.points}</Text>
              <Text style={styles.rewardTitle}>{r.title}</Text>
              <Text style={styles.rewardDesc}>{r.desc}</Text>
              <Pressable
                onPress={async () => {
                  if (!can) return;
                  try { await Haptics.selectionAsync(); } catch {}
                  redeem.mutate({ points: r.points, description: `Redeemed ${r.title}` });
                }}
                disabled={!can || redeem.isPending}
                style={[styles.btn, !can && styles.btnDisabled]}
              >
                <Text style={[styles.btnText, !can && { color: colors.muted }]}>{can ? "Redeem" : `${r.points}`}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      {redeem.isError && <Text style={styles.error}>{String((redeem.error as Error)?.message ?? "Redeem failed")}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", color: colors.muted },
  grid: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pts: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: colors.clay },
  rewardTitle: { fontSize: 12, fontWeight: "700", color: colors.foreground, textAlign: "center" },
  rewardDesc: { fontSize: 10, color: colors.mutedLight, textAlign: "center" },
  btn: { marginTop: 4, paddingHorizontal: 12, height: 28, borderRadius: 999, backgroundColor: colors.foreground, alignItems: "center", justifyContent: "center", minWidth: 64 },
  btnDisabled: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 10, fontWeight: "800", color: colors.surface, letterSpacing: 0.5 },
  error: { fontSize: 11, color: colors.error, textAlign: "center" },
  pendingBanner: { padding: 8, borderRadius: radius.lg, backgroundColor: colors.successBackground, borderWidth: 1, borderColor: "#A3D9B1", alignItems: "center" },
  pendingText: { fontSize: 10, fontWeight: "700", color: colors.success, textAlign: "center" },
  success: { fontSize: 10, fontWeight: "600", color: colors.success, textAlign: "center" },
});
