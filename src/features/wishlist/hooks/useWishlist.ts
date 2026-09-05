import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "@/stores/authStore";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: (uid?: string) => [...wishlistKeys.all, "list", uid ?? "anon"] as const,
  ids: (uid?: string) => [...wishlistKeys.all, "ids", uid ?? "anon"] as const,
};

export function useWishlistQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: wishlistKeys.list(userId),
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFavoriteIdsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: wishlistKeys.ids(userId),
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
      const uid = useAuthStore.getState().user?.id;
      await qc.cancelQueries({ queryKey: wishlistKeys.ids(uid) });
      await qc.cancelQueries({ queryKey: wishlistKeys.list(uid) });
      const prevIds = qc.getQueryData<Set<string>>(wishlistKeys.ids(uid));
      const prevList = qc.getQueryData(wishlistKeys.list(uid));

      // Optimistic ids
      if (prevIds) {
        const next = new Set(prevIds);
        if (isCurrentlyFavorite) next.delete(productId);
        else next.add(productId);
        qc.setQueryData(wishlistKeys.ids(uid), next);
      }

      return { prevIds, prevList };
    },
    onError: (_err, _vars, ctx) => {
      const uid = useAuthStore.getState().user?.id;
      if (ctx?.prevIds) qc.setQueryData(wishlistKeys.ids(uid), ctx.prevIds);
      if (ctx?.prevList) qc.setQueryData(wishlistKeys.list(uid), ctx.prevList);
    },
    onSettled: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: wishlistKeys.ids(uid) });
      qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.addFavorite(productId),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: wishlistKeys.ids(uid) });
      qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFavorite(productId),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: wishlistKeys.ids(uid) });
      qc.invalidateQueries({ queryKey: wishlistKeys.list(uid) });
    },
  });
}
