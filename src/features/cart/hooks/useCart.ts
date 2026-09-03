import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService, type CartItem } from "../services/cartService";
import { useAuthStore } from "@/stores/authStore";

export const cartKeys = {
  all: ["cart"] as const,
  list: () => [...cartKeys.all, "list"] as const,
};

export function useCartQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: () => cartService.getCart(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity?: number }) =>
      cartService.addToCart(variantId, quantity ?? 1),
    onMutate: async ({ variantId, quantity }) => {
      await qc.cancelQueries({ queryKey: cartKeys.list() });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list());
      // Optimistic: if item exists, bump qty, else add placeholder
      if (prev) {
        const idx = prev.findIndex((it) => it.variant_id === variantId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + (quantity ?? 1) };
          qc.setQueryData(cartKeys.list(), next);
        }
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(cartKeys.list(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: cartKeys.list() }),
  });
}

export function useUpdateCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      cartService.updateQuantity(cartItemId, quantity),
    onMutate: async ({ cartItemId, quantity }) => {
      await qc.cancelQueries({ queryKey: cartKeys.list() });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list());
      if (prev) {
        if (quantity <= 0) {
          qc.setQueryData(cartKeys.list(), prev.filter((it) => it.id !== cartItemId));
        } else {
          qc.setQueryData(
            cartKeys.list(),
            prev.map((it) => (it.id === cartItemId ? { ...it, quantity } : it))
          );
        }
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(cartKeys.list(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: cartKeys.list() }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onMutate: async (cartItemId) => {
      await qc.cancelQueries({ queryKey: cartKeys.list() });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list());
      if (prev) qc.setQueryData(cartKeys.list(), prev.filter((it) => it.id !== cartItemId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(cartKeys.list(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: cartKeys.list() }),
  });
}
