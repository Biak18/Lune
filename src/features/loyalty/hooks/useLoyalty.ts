import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loyaltyService } from "../services/loyaltyService";
import { useAuthStore } from "@/stores/authStore";

export const loyaltyKeys = {
  all: ["loyalty"] as const,
  account: () => [...loyaltyKeys.all, "account"] as const,
  tx: () => [...loyaltyKeys.all, "tx"] as const,
};

export function useLoyaltyAccount() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: loyaltyKeys.account(),
    queryFn: () => loyaltyService.getAccount(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useLoyaltyTx() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: loyaltyKeys.tx(),
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
      qc.invalidateQueries({ queryKey: loyaltyKeys.account() });
      qc.invalidateQueries({ queryKey: loyaltyKeys.tx() });
    },
  });
}
