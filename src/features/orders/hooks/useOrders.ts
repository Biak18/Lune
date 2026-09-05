import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { useAuthStore } from "@/stores/authStore";
import { cartKeys } from "@/features/cart/hooks/useCart";

export const orderKeys = {
  all: ["orders"] as const,
  list: (userId?: string) => [...orderKeys.all, "list", userId ?? "anon"] as const,
  detail: (id: string, userId?: string) => [...orderKeys.all, "detail", id, userId ?? "anon"] as const,
};

export function useOrdersQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: orderKeys.list(userId),
    queryFn: () => orderService.getOrders(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useOrderQuery(id: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: orderKeys.detail(id, userId),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof orderService.createOrder>[0]) => orderService.createOrder(args),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: orderKeys.list(uid) });
      qc.invalidateQueries({ queryKey: cartKeys.list(uid) });
      qc.invalidateQueries({ queryKey: ["loyalty", uid] });
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: orderKeys.list(uid) });
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId, uid) });
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
