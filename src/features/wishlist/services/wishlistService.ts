import { supabase } from "@/lib/supabase";
import type { ProductWithRelations } from "@/features/products/types";

export const wishlistService = {
  async getWishlist(): Promise<ProductWithRelations[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        product:products(
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    const products = (data ?? [])
      .map((row: any) => row.product)
      .filter(Boolean)
      .map((p: any) => ({
        ...p,
        images: [...(p.images ?? [])].sort((a: any, b: any) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        }),
      }));
    return products as ProductWithRelations[];
  },

  async getFavoriteIds(): Promise<Set<string>> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return new Set();
    const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", userId);
    if (error) throw error;
    return new Set((data ?? []).map((r) => r.product_id));
  },

  async addFavorite(productId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in to save items");
    const { error } = await supabase.from("favorites").insert({ user_id: userId, product_id: productId });
    if (error) {
      // Ignore duplicate (already favorited) — idempotent
      if (error.code === "23505") return;
      throw error;
    }
  },

  async removeFavorite(productId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId);
    if (error) throw error;
  },

  async isFavorite(productId: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return false;
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
};
