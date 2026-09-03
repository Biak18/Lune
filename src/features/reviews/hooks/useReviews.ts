import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/reviewService";
import { useAuthStore } from "@/stores/authStore";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (productId: string) => [...reviewKeys.all, "list", productId] as const,
  avg: (productId: string) => [...reviewKeys.all, "avg", productId] as const,
  verified: (productId: string, userId?: string | null) => [...reviewKeys.all, "verified", productId, userId] as const,
};

export function useReviewsQuery(productId: string) {
  return useQuery({
    queryKey: reviewKeys.list(productId),
    queryFn: () => reviewService.getReviews(productId),
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
}

export function useReviewAvgQuery(productId: string) {
  return useQuery({
    queryKey: reviewKeys.avg(productId),
    queryFn: () => reviewService.getAverage(productId),
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
}

export function useVerifiedPurchaseQuery(productId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: reviewKeys.verified(productId, userId ?? null),
    queryFn: () => reviewService.isVerifiedPurchase(productId),
    enabled: !!productId && !!userId,
    staleTime: 1000 * 60,
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { rating: number; body?: string }) => reviewService.createReview({ productId, ...args }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.avg(productId) });
    },
  });
}

export function useUpdateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, rating, body }: { reviewId: string; rating: number; body?: string }) =>
      reviewService.updateReview(reviewId, { rating, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.avg(productId) });
    },
  });
}

export function useDeleteReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(productId) });
      qc.invalidateQueries({ queryKey: reviewKeys.avg(productId) });
    },
  });
}
