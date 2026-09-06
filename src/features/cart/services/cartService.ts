import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type CartVariant = Tables<"product_variants"> & {
  product: (Tables<"products"> & {
    category: Tables<"categories"> | null;
    images: Tables<"product_images">[];
  }) | null;
};

export type CartItem = {
  id: string;
  quantity: number;
  variant_id: string;
  variant: CartVariant;
  created_at: string;
  updated_at: string;
};

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        variant_id,
        created_at,
        updated_at,
        variant:product_variants(
          *,
          product:products(
            *,
            category:categories(*),
            images:product_images(*)
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    const normalized = (data ?? []).map((row: any) => {
      const v = row.variant;
      if (v?.product?.images) {
        v.product.images = [...v.product.images].sort((a: any, b: any) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
      }
      return {
        id: row.id,
        quantity: row.quantity,
        variant_id: row.variant_id,
        variant: v,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as CartItem;
    });
    return normalized;
  },

  async addToCart(variantId: string, quantity = 1): Promise<void> {
    // Single round trip: stock validation + atomic upsert happen server-side.
    // User identity comes from auth.uid() inside the RPC, so no client-side
    // getUser() hop is needed.
    const { error } = await supabase.rpc("add_to_cart", {
      p_variant_id: variantId,
      p_quantity: quantity,
    });
    if (error) throw error;
  },

  async updateQuantity(cartItemId: string, newQuantity: number): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");

    if (newQuantity <= 0) {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", userId);
      if (error) throw error;
      return;
    }

    // Stock check via join
    const { data: row } = await supabase
      .from("cart_items")
      .select("variant_id, variant:product_variants(stock_quantity, is_active)")
      .eq("id", cartItemId)
      .eq("user_id", userId)
      .single();
    const variant: any = (row as any)?.variant;
    if (!variant) throw new Error("Item not found");
    if (variant.is_active === false) throw new Error("Unavailable");
    if (newQuantity > (variant.stock_quantity ?? 0)) throw new Error(`Only ${variant.stock_quantity} in stock`);

    const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId).eq("user_id", userId);
    if (error) throw error;
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", userId);
    if (error) throw error;
  },

  async clearCart(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (error) throw error;
  },
};
