import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loyaltyService } from "../services/loyaltyService";
import { useAuthStore } from "@/stores/authStore";

export const loyaltyKeys = {
  all: ["loyalty"] as const,
  account: (uid?: string) => [...loyaltyKeys.all, "account", uid ?? "anon"] as const,
  tx: (uid?: string) => [...loyaltyKeys.all, "tx", uid ?? "anon"] as const,
  pending: (uid?: string) => [...loyaltyKeys.all, "pending", uid ?? "anon"] as const,
};

export function useLoyaltyAccount() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: loyaltyKeys.account(userId),
    queryFn: () => loyaltyService.getAccount(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useLoyaltyTx() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: loyaltyKeys.tx(userId),
    queryFn: () => loyaltyService.getTransactions(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useRedeem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ points, description }: { points: number; description?: string }) => loyaltyService.redeem(points, description),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: loyaltyKeys.account(uid) });
      qc.invalidateQueries({ queryKey: loyaltyKeys.tx(uid) });
      qc.invalidateQueries({ queryKey: loyaltyKeys.pending(uid) });
    },
  });
}

export function useLoyaltyPending() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: loyaltyKeys.pending(userId),
    queryFn: () => loyaltyService.getPendingDiscount(),
    enabled: !!userId,
    staleTime: 1000 * 10,
  });
}
