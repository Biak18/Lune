import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Review = Tables<"reviews"> & {
  profile?: { full_name: string | null; avatar_url: string | null } | null;
};

export const reviewService = {
  async getReviews(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles!reviews_user_id_fkey(full_name, avatar_url)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as any[]) ?? [];
  },

  async getAverage(productId: string): Promise<{ avg: number; count: number }> {
    const { data, error } = await supabase.from("reviews").select("rating").eq("product_id", productId);
    if (error) throw error;
    const ratings = (data ?? []).map((r) => r.rating);
    const count = ratings.length;
    const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
    return { avg, count };
  },

  async isVerifiedPurchase(productId: string): Promise<{ verified: boolean; orderItemId: string | null }> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { verified: false, orderItemId: null };
    // Find any delivered/confirmed order containing this product
    const { data, error } = await supabase
      .from("order_items")
      .select("id, order_id, orders!inner(user_id, status)")
      .eq("product_id", productId)
      .eq("orders.user_id", userId);
    if (error) return { verified: false, orderItemId: null };
    const candidate = (data as any[])?.find((r) => r.orders?.status !== "cancelled") ?? (data as any[])?.[0];
    if (candidate) return { verified: true, orderItemId: candidate.id };
    return { verified: false, orderItemId: null };
  },

  async createReview(args: { productId: string; rating: number; body?: string }): Promise<Review> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in to review");
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be 1-5");
    // guard duplicate (app-level, DB has no unique yet)
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", args.productId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) throw new Error("You have already reviewed this product");
    const { orderItemId } = await reviewService.isVerifiedPurchase(args.productId);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: args.productId,
        user_id: userId,
        rating: args.rating,
        body: args.body?.trim() || null,
        order_item_id: orderItemId,
      } as any)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("You have already reviewed this product");
      throw error;
    }
    return data as Review;
  },

  async updateReview(reviewId: string, args: { rating: number; body?: string }): Promise<Review> {
    const { data, error } = await supabase
      .from("reviews")
      .update({ rating: args.rating, body: args.body?.trim() || null } as any)
      .eq("id", reviewId)
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) throw error;
  },
};
