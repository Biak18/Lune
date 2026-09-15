import { api } from "@/lib/api";

type ApiStats = {
  products: number;
  orders: number;
  lowStock: number;
  categories: number;
  customers: number;
};

export const adminService = {
  async getStats() {
    const s = await api.get<ApiStats>("/api/admin/stats");
    return {
      products: s.products ?? 0,
      orders: s.orders ?? 0,
      lowStock: s.lowStock ?? 0,
      categories: s.categories ?? 0,
      customers: s.customers ?? 0,
    };
  },

  async getAllOrders() {
    const data = await api.get<any[]>("/api/admin/orders", { limit: 50 });
    return (data ?? []).map((o) => ({
      id: o.id,
      status: o.status,
      subtotal: o.subtotal,
      shipping_amount: o.shippingAmount,
      discount_amount: o.discountAmount,
      total: o.total,
      created_at: o.createdAt,
      updated_at: o.updatedAt,
      items: o.items ?? [],
    }));
  },

  async getLowStock() {
    const data = await api.get<any[]>("/api/admin/low-stock", {
      threshold: 3,
      limit: 20,
    });
    return (data ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock_quantity: v.stockQuantity,
      product: v.product
        ? { name: v.product.name, slug: v.product.slug }
        : null,
    }));
  },

  async toggleProductActive(id: string, isActive: boolean) {
    await api.patch(`/api/admin/products/${id}/active`, { isActive });
  },

  async updateVariantStock(variantId: string, quantity: number) {
    if (quantity < 0) throw new Error("Stock cannot be negative");
    await api.patch(`/api/admin/variants/${variantId}/stock`, { quantity });
  },

  async updateOrderStatus(id: string, status: string) {
    await api.patch(`/api/admin/orders/${id}/status`, { status });
  },

  async getCategoriesAdmin() {
    const data = await api.get<any[]>("/api/admin/categories");
    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      is_active: c.isActive,
      sort_order: c.sortOrder ?? 0,
    }));
  },

  async createCategory(payload: { name: string; slug: string; description?: string | null; is_active?: boolean }) {
    const data = await api.post<any>("/api/admin/categories", {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      isActive: payload.is_active ?? true,
      sortOrder: 0,
    });
    return data;
  },

  async updateCategory(id: string, patch: Partial<{ name: string; slug: string; description: string | null; is_active: boolean; sort_order: number }>) {
    const p = patch as Record<string, any>;
    const data = await api.put<any>(`/api/admin/categories/${id}`, {
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      isActive: p.is_active,
      sortOrder: p.sort_order ?? 0,
    });
    return data;
  },

  async deleteCategory(id: string) {
    await api.delete(`/api/admin/categories/${id}`);
  },
};
