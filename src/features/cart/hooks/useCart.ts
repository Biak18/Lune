import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService, type CartItem } from "../services/cartService";
import { useAuthStore } from "@/stores/authStore";

export const cartKeys = {
  all: ["cart"] as const,
  list: (uid?: string) => [...cartKeys.all, "list", uid ?? "anon"] as const,
};

export function useCartQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: cartKeys.list(userId),
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
      const uid = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: cartKeys.list(uid) });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list(uid));
      if (prev) {
        const idx = prev.findIndex((it) => it.variant_id === variantId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + (quantity ?? 1) };
          qc.setQueryData(cartKeys.list(uid), next);
        } else {
          // New item: create optimistic placeholder so wishlist->bag feels instant
          const optimistic: CartItem = {
            id: `optimistic-${variantId}-${Date.now()}`,
            quantity: quantity ?? 1,
            variant_id: variantId,
            variant: {
              id: variantId,
              sku: "optimistic",
              stock_quantity: 999,
              is_active: true,
              product: null,
            } as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          qc.setQueryData(cartKeys.list(uid), [...prev, optimistic]);
        }
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      const uid = useAuthStore.getState().user?.id;
      if (ctx?.prev) qc.setQueryData(cartKeys.list(uid), ctx.prev);
    },
    onSettled: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: cartKeys.list(uid) });
    },
  });
}

export function useUpdateCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      cartService.updateQuantity(cartItemId, quantity),
    onMutate: async ({ cartItemId, quantity }) => {
      const uid = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: cartKeys.list(uid) });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list(uid));
      if (prev) {
        if (quantity <= 0) {
          qc.setQueryData(cartKeys.list(uid), prev.filter((it) => it.id !== cartItemId));
        } else {
          qc.setQueryData(
            cartKeys.list(uid),
            prev.map((it) => (it.id === cartItemId ? { ...it, quantity } : it))
          );
        }
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      const uid = useAuthStore.getState().user?.id;
      if (ctx?.prev) qc.setQueryData(cartKeys.list(uid), ctx.prev);
    },
    onSettled: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: cartKeys.list(uid) });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onMutate: async (cartItemId) => {
      const uid = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: cartKeys.list(uid) });
      const prev = qc.getQueryData<CartItem[]>(cartKeys.list(uid));
      if (prev) qc.setQueryData(cartKeys.list(uid), prev.filter((it) => it.id !== cartItemId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      const uid = useAuthStore.getState().user?.id;
      if (ctx?.prev) qc.setQueryData(cartKeys.list(uid), ctx.prev);
    },
    onSettled: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: cartKeys.list(uid) });
    },
  });
}
