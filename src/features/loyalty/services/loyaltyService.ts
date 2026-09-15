import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Tables } from "@/types/database";

export type LoyaltyAccount = Tables<"loyalty_accounts">;
export type LoyaltyTx = Tables<"loyalty_transactions">;

type ApiAccount = {
  points: number;
  tier: string;
  updatedAt: string;
};

type ApiTx = {
  id: string;
  points: number;
  type: string;
  description?: string | null;
  orderId?: string | null;
  createdAt: string;
};

const tierForPoints = (points: number): LoyaltyAccount["tier"] => {
  if (points >= 2000) return "platinum";
  if (points >= 1000) return "gold";
  if (points >= 400) return "silver";
  return "bronze";
};

const tierThresholds: Record<string, number> = { bronze: 0, silver: 400, gold: 1000, platinum: 2000 };

const authed = () => useAuthStore.getState().isAuthenticated;

function mapAccount(a: ApiAccount): LoyaltyAccount {
  const now = new Date().toISOString();
  return {
    user_id: useAuthStore.getState().user?.id ?? "",
    points: a.points,
    tier: a.tier,
    referral_code: null,
    created_at: now,
    updated_at: a.updatedAt,
  } as LoyaltyAccount;
}

function mapTx(t: ApiTx): LoyaltyTx {
  return {
    id: t.id,
    user_id: useAuthStore.getState().user?.id ?? "",
    points: t.points,
    type: t.type,
    description: t.description ?? null,
    order_id: t.orderId ?? null,
    created_at: t.createdAt,
  } as LoyaltyTx;
}

export const loyaltyService = {
  tierForPoints,
  tierThresholds,

  async getAccount(): Promise<LoyaltyAccount | null> {
    if (!authed()) return null;
    try {
      const data = await api.get<ApiAccount>("/api/loyalty/account");
      return mapAccount(data);
    } catch {
      return null;
    }
  },

  async getTransactions(limit = 20): Promise<LoyaltyTx[]> {
    if (!authed()) return [];
    try {
      const data = await api.get<ApiTx[]>("/api/loyalty/transactions", { limit });
      return (data ?? []).map(mapTx);
    } catch {
      return [];
    }
  },

  async earnPointsForOrder(_orderId: string, _total: number): Promise<void> {
    // Server-side: EarnPointsAsync runs inside order creation.
    return;
  },

  async redeem(points: number, description = "Reward redeem"): Promise<void> {
    await api.post("/api/loyalty/redeem", { points, description });
  },

  /** Pending redeem discount: unused redeem transactions (order_id is null). */
  async getPendingDiscount(): Promise<{ amount: number; freeShipping: boolean; txIds: string[] }> {
    const txs = await loyaltyService.getTransactions(100);
    let amount = 0;
    let freeShipping = false;
    const txIds: string[] = [];
    for (const r of txs) {
      if (r.type !== "redeem" || r.order_id !== null) continue;
      const pts = Math.abs(Number(r.points));
      txIds.push(r.id);
      if (pts === 200) amount += 10;
      else if (pts === 400) amount += 25;
      else if (pts === 800) freeShipping = true;
    }
    return { amount, freeShipping, txIds };
  },

  async consumePendingDiscount(_orderId: string): Promise<void> {
    // Server-side: ConsumePendingRedemptionsAsync runs inside order creation.
    return;
  },
};
