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

  async cancelOrder(orderId: string): Promise<Order> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).eq("user_id", userId).single();
    if (error) throw error;
    if (!order) throw new Error("Order not found");
    const cancellable = ["pending", "confirmed"].includes(order.status);
    if (!cancellable) throw new Error(`Cannot cancel order in "${order.status}" status`);
    const { data: updated, error: upErr } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("user_id", userId).select().single();
    if (upErr) throw upErr;
    // Restore stock for each item
    try {
      const { data: items } = await supabase.from("order_items").select("variant_id, quantity").eq("order_id", orderId);
      for (const it of (items ?? []) as any[]) {
        if (!it.variant_id) continue;
        const { data: v } = await supabase.from("product_variants").select("stock_quantity").eq("id", it.variant_id).maybeSingle();
        if (v) await supabase.from("product_variants").update({ stock_quantity: (v.stock_quantity ?? 0) + it.quantity }).eq("id", it.variant_id);
      }
    } catch {}
    return updated as Order;
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

    // Apply pending loyalty discount (e.g. 200-> $10, 400-> $25, 800 -> free shipping)
    let pending: { amount: number; freeShipping: boolean } = { amount: 0, freeShipping: false };
    try {
      const { loyaltyService } = await import("@/features/loyalty/services/loyaltyService");
      const p = await loyaltyService.getPendingDiscount();
      pending = { amount: p.amount, freeShipping: p.freeShipping };
    } catch {}

    const totals = calculateCartTotals(args.cartItems, { discount: pending.amount, freeShipping: pending.freeShipping });

    // Create order
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        subtotal: totals.subtotal,
        shipping_amount: totals.shipping,
        discount_amount: totals.discount,
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

    // Mark redeem as used (link to order) so it can't be reused
    try {
      const { loyaltyService } = await import("@/features/loyalty/services/loyaltyService");
      if (pending.amount > 0 || pending.freeShipping) {
        await loyaltyService.consumePendingDiscount(order.id);
      }
    } catch {}

    // Earn loyalty points (1 per $1)
    try {
      const { loyaltyService } = await import("@/features/loyalty/services/loyaltyService");
      await loyaltyService.earnPointsForOrder(order.id, Number(order.total));
    } catch {}

    // Create notification for order confirmed (respect prefs)
    try {
      const { data: prefs } = await supabase.from("notification_preferences").select("order_updates").eq("user_id", userId).maybeSingle();
      const allow = prefs ? (prefs as any).order_updates !== false : true;
      if (allow) {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "order_confirmed",
          title: "Order confirmed",
          body: `Your order #${order.id.slice(0, 8).toUpperCase()} is confirmed. We'll notify when it ships.`,
          data: { order_id: order.id, total: order.total },
        } as any);
      }
    } catch {}

    return order as Order;
  },
};
