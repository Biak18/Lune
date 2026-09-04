import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type LoyaltyAccount = Tables<"loyalty_accounts">;
export type LoyaltyTx = Tables<"loyalty_transactions">;

const tierForPoints = (points: number): LoyaltyAccount["tier"] => {
  if (points >= 2000) return "platinum";
  if (points >= 1000) return "gold";
  if (points >= 400) return "silver";
  return "bronze";
};

const tierThresholds: Record<string, number> = { bronze: 0, silver: 400, gold: 1000, platinum: 2000 };

export const loyaltyService = {
  tierForPoints,
  tierThresholds,

  async getAccount(): Promise<LoyaltyAccount | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase.from("loyalty_accounts").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (!data) {
      const { data: created, error: cErr } = await supabase.from("loyalty_accounts").insert({ user_id: userId, points: 0, tier: "bronze" } as any).select().single();
      if (cErr) throw cErr;
      return created as LoyaltyAccount;
    }
    // auto-upgrade tier if points crossed threshold (best effort)
    const correctTier = tierForPoints((data as any).points);
    if (correctTier !== (data as any).tier) {
      const { data: upd } = await supabase.from("loyalty_accounts").update({ tier: correctTier } as any).eq("user_id", userId).select().single();
      return (upd as LoyaltyAccount) ?? (data as LoyaltyAccount);
    }
    return data as LoyaltyAccount;
  },

  async getTransactions(limit = 20): Promise<LoyaltyTx[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];
    const { data, error } = await supabase.from("loyalty_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data as LoyaltyTx[]) ?? [];
  },

  async earnPointsForOrder(orderId: string, total: number): Promise<void> {
    const points = Math.floor(total); // 1 point per $1
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data: acct } = await supabase.from("loyalty_accounts").select("points").eq("user_id", userId).maybeSingle();
    const current = (acct as any)?.points ?? 0;
    const nextPoints = current + points;
    const nextTier = tierForPoints(nextPoints);
    await supabase.from("loyalty_accounts").update({ points: nextPoints, tier: nextTier } as any).eq("user_id", userId);
    await supabase.from("loyalty_transactions").insert({
      user_id: userId,
      points,
      type: "earn",
      description: `Earned for order #${orderId.slice(0, 8).toUpperCase()}`,
      order_id: orderId,
    } as any);
  },

  async redeem(points: number, description = "Reward redeem"): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    const { data: acct, error } = await supabase.from("loyalty_accounts").select("points").eq("user_id", userId).single();
    if (error) throw error;
    const cur = (acct as any).points ?? 0;
    if (cur < points) throw new Error(`Need ${points} points, you have ${cur}`);
    const next = cur - points;
    await supabase.from("loyalty_accounts").update({ points: next, tier: tierForPoints(next) } as any).eq("user_id", userId);
    await supabase.from("loyalty_transactions").insert({ user_id: userId, points: -points, type: "redeem", description } as any);
  },

  /** Pending redeem discount for next order: sums unused redeem transactions (order_id is null) */
  async getPendingDiscount(): Promise<{ amount: number; freeShipping: boolean; txIds: string[] }> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { amount: 0, freeShipping: false, txIds: [] };
    const { data, error } = await supabase
      .from("loyalty_transactions")
      .select("id, points")
      .eq("user_id", userId)
      .eq("type", "redeem")
      .is("order_id", null);
    if (error || !data) return { amount: 0, freeShipping: false, txIds: [] };
    let amount = 0;
    let freeShipping = false;
    const txIds: string[] = [];
    for (const r of data as any[]) {
      const pts = Math.abs(Number(r.points));
      txIds.push(r.id);
      if (pts === 200) amount += 10;
      else if (pts === 400) amount += 25;
      else if (pts === 800) freeShipping = true;
      else amount += 0;
    }
    return { amount, freeShipping, txIds };
  },

  async consumePendingDiscount(orderId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    // Mark all pending redeems as used by linking to order
    await supabase.from("loyalty_transactions").update({ order_id: orderId } as any).eq("user_id", userId).eq("type", "redeem").is("order_id", null);
  },
};
