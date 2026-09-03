import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "@/stores/authStore";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: () => [...wishlistKeys.all, "list"] as const,
  ids: () => [...wishlistKeys.all, "ids"] as const,
};

export function useWishlistQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFavoriteIdsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: wishlistKeys.ids(),
    queryFn: () => wishlistService.getFavoriteIds(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, isCurrentlyFavorite }: { productId: string; isCurrentlyFavorite: boolean }) => {
      if (isCurrentlyFavorite) await wishlistService.removeFavorite(productId);
      else await wishlistService.addFavorite(productId);
      return !isCurrentlyFavorite;
    },
    onMutate: async ({ productId, isCurrentlyFavorite }) => {
      await qc.cancelQueries({ queryKey: wishlistKeys.ids() });
      await qc.cancelQueries({ queryKey: wishlistKeys.list() });
      const prevIds = qc.getQueryData<Set<string>>(wishlistKeys.ids());
      const prevList = qc.getQueryData(wishlistKeys.list());

      // Optimistic ids
      if (prevIds) {
        const next = new Set(prevIds);
        if (isCurrentlyFavorite) next.delete(productId);
        else next.add(productId);
        qc.setQueryData(wishlistKeys.ids(), next);
      }

      return { prevIds, prevList };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevIds) qc.setQueryData(wishlistKeys.ids(), ctx.prevIds);
      if (ctx?.prevList) qc.setQueryData(wishlistKeys.list(), ctx.prevList);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.ids() });
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.addFavorite(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.ids() });
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFavorite(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.ids() });
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
  });
}
