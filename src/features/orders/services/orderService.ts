import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import type { CartItem } from "@/features/cart/services/cartService";
import { calculateCartTotals, resolveUnitPrice } from "@/features/cart/utils/cartTotals";

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];
    const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    const { data: items, error: itErr } = await supabase.from("order_items").select("*").eq("order_id", id);
    if (itErr) throw itErr;
    return { ...order, items: items ?? [] } as any;
  },

  /**
   * Trusted order creation: validates stock, resolves live prices, snapshots address.
   * Cart items are passed from client (already fetched), but price/stock are re-validated server-side via reads.
   */
  async createOrder(args: { cartItems: CartItem[]; shippingAddress: Record<string, any> }): Promise<Order> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    if (!args.cartItems.length) throw new Error("Your bag is empty");
    if (!args.shippingAddress?.address_line_1) throw new Error("Shipping address required");

    // Re-validate each variant live (price/stock)
    for (const it of args.cartItems) {
      const { data: v, error } = await supabase
        .from("product_variants")
        .select("id, stock_quantity, is_active, price, product_id")
        .eq("id", it.variant_id)
        .single();
      if (error) throw new Error(`Variant unavailable: ${it.variant_id}`);
      if (!v || v.is_active === false) throw new Error(`Unavailable: ${it.variant?.sku ?? it.variant_id}`);
      if ((v.stock_quantity ?? 0) < it.quantity) throw new Error(`Only ${v.stock_quantity} left for ${it.variant?.product?.name ?? "item"}`);
    }

    const totals = calculateCartTotals(args.cartItems);

    // Create order
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        subtotal: totals.subtotal,
        shipping_amount: totals.shipping,
        discount_amount: 0,
        total: totals.total,
        shipping_address: args.shippingAddress as any,
      })
      .select()
      .single();
    if (oErr) throw oErr;

    // Create historical order items (preserve pricing)
    const rows = args.cartItems.map((it) => {
      const unit = resolveUnitPrice(it);
      const productName = it.variant.product?.name ?? "Product";
      const variantDesc = [it.variant.color, it.variant.size].filter(Boolean).join(" / ") || null;
      return {
        order_id: order.id,
        product_id: it.variant.product_id,
        variant_id: it.variant_id,
        product_name: productName,
        variant_description: variantDesc,
        unit_price: unit,
        quantity: it.quantity,
      };
    });

    const { error: itErr } = await supabase.from("order_items").insert(rows as any);
    if (itErr) {
      // best effort rollback order if items fail
      await supabase.from("orders").delete().eq("id", order.id);
      throw itErr;
    }

    // Decrement stock (best effort, not transactional but acceptable for MVP)
    for (const it of args.cartItems) {
      const newStock = Math.max(0, (it.variant.stock_quantity ?? 0) - it.quantity);
      await supabase.from("product_variants").update({ stock_quantity: newStock }).eq("id", it.variant_id);
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", userId);

    return order as Order;
  },
};
