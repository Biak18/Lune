import { api } from "@/lib/api";
import type { Tables } from "@/types/database";

export type Review = Tables<"reviews"> & {
  profile?: { full_name: string | null; avatar_url: string | null } | null;
};

type ApiReview = {
  id: string;
  userId: string;
  productId: string;
  orderItemId?: string | null;
  rating: number;
  body?: string | null;
  createdAt: string;
  updatedAt: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

function mapReview(r: ApiReview): Review {
  return {
    id: r.id,
    user_id: r.userId,
    product_id: r.productId,
    order_item_id: r.orderItemId ?? null,
    rating: r.rating,
    body: r.body ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    profile: {
      full_name: r.fullName ?? null,
      avatar_url: r.avatarUrl ?? null,
    },
  } as unknown as Review;
}

// Backend ReviewsController is [Route("api/reviews")] with nested
// action routes: lists at /api/reviews/products/{id}/reviews,
// single-review ops at /api/reviews/{id}.
const base = "/api/reviews";

export const reviewService = {
  async getReviews(productId: string): Promise<Review[]> {
    const data = await api.get<ApiReview[]>(
      `${base}/products/${productId}/reviews`,
    );
    return (data ?? []).map(mapReview);
  },

  async getAverage(productId: string): Promise<{ avg: number; count: number }> {
    try {
      const res = await api.get<{ average: number; count: number }>(
        `${base}/products/${productId}/reviews/summary`,
      );
      return {
        avg: (res as any).average ?? (res as any).avg ?? 0,
        count: res.count ?? 0,
      };
    } catch {
      return { avg: 0, count: 0 };
    }
  },

  async isVerifiedPurchase(productId: string): Promise<{ verified: boolean; orderItemId: string | null }> {
    try {
      const res = await api.get<{ verified: boolean; orderItemId?: string | null }>(
        `${base}/products/${productId}/reviews/eligibility`,
      );
      return {
        verified: res.verified === true,
        orderItemId: res.orderItemId ?? null,
      };
    } catch {
      return { verified: false, orderItemId: null };
    }
  },

  async createReview(args: { productId: string; rating: number; body?: string }): Promise<Review> {
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be 1-5");
    const data = await api.post<ApiReview>(
      `${base}/products/${args.productId}/reviews`,
      { rating: args.rating, body: args.body?.trim() || null },
    );
    return mapReview(data);
  },

  async updateReview(reviewId: string, args: { rating: number; body?: string }): Promise<Review> {
    const data = await api.put<ApiReview>(`${base}/${reviewId}`, {
      rating: args.rating,
      body: args.body?.trim() || null,
    });
    return mapReview(data);
  },

  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`${base}/${reviewId}`);
  },
};
