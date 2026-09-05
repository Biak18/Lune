import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { useAuthStore } from "@/stores/authStore";
import { cartKeys } from "@/features/cart/hooks/useCart";

export const orderKeys = {
  all: ["orders"] as const,
  list: () => [...orderKeys.all, "list"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrdersQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => orderService.getOrders(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof orderService.createOrder>[0]) => orderService.createOrder(args),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.list() });
      qc.invalidateQueries({ queryKey: cartKeys.list() });
      qc.invalidateQueries({ queryKey: ["loyalty"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: orderKeys.list() });
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
