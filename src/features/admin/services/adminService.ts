import { supabase } from "@/lib/supabase";

export const adminService = {
  async getStats() {
    const [products, orders, variantsLow, categories, users] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("product_variants").select("id", { count: "exact", head: true }).lte("stock_quantity", 3),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    return {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      lowStock: variantsLow.count ?? 0,
      categories: categories.count ?? 0,
      customers: users.count ?? 0,
    };
  },

  async getAllOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async getLowStock() {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, sku, color, size, stock_quantity, product:products(name, slug)")
      .lte("stock_quantity", 3)
      .order("stock_quantity", { ascending: true })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },

  async toggleProductActive(id: string, isActive: boolean) {
    const { error } = await supabase.from("products").update({ is_active: isActive } as any).eq("id", id);
    if (error) throw error;
  },

  async updateOrderStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status } as any).eq("id", id);
    if (error) throw error;
  },
};
