import { api } from "@/lib/api";

type ApiStats = {
  products: number;
  orders: number;
  lowStock: number;
  categories: number;
  customers: number;
};

type ApiAdminOrder = {
  id: string;
  userId?: string | null;
  user_id?: string | null;
  status: string;
  subtotal: number;
  shippingAmount?: number | null;
  shipping_amount?: number | null;
  discountAmount?: number | null;
  discount_amount?: number | null;
  total: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  items?: unknown[];
};

export type AdminOrder = {
  id: string;
  user_id: string | null;
  status: string;
  subtotal: number;
  shipping_amount: number | null;
  discount_amount: number | null;
  total: number;
  created_at: string | undefined;
  updated_at: string | undefined;
  items: unknown[];
};

type ApiLowStockVariant = {
  id: string;
  sku: string;
  color?: string | null;
  size?: string | null;
  stockQuantity: number;
  stock_quantity?: number;
  product?: { name: string; slug: string } | null;
};

export type LowStockVariant = {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  stock_quantity: number;
  product: { name: string; slug: string } | null;
};

type ApiAdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  is_active?: boolean;
  sortOrder?: number | null;
  sort_order?: number | null;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
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

  async getAllOrders(): Promise<AdminOrder[]> {
    const data = await api.get<ApiAdminOrder[]>("/api/admin/orders", { limit: 50 });
    return (data ?? []).map((o) => ({
      id: o.id,
      // Backend order DTO currently carries no customer reference; map it
      // defensively so the UI can show it if the API adds it later.
      user_id: o.userId ?? o.user_id ?? null,
      status: o.status,
      subtotal: o.subtotal,
      shipping_amount: o.shippingAmount ?? o.shipping_amount ?? null,
      discount_amount: o.discountAmount ?? o.discount_amount ?? null,
      total: o.total,
      created_at: o.createdAt ?? o.created_at,
      updated_at: o.updatedAt ?? o.updated_at,
      items: o.items ?? [],
    }));
  },

  async getLowStock(): Promise<LowStockVariant[]> {
    const data = await api.get<ApiLowStockVariant[]>("/api/admin/low-stock", {
      threshold: 3,
      limit: 20,
    });
    return (data ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color ?? null,
      size: v.size ?? null,
      stock_quantity: v.stockQuantity ?? v.stock_quantity ?? 0,
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

  async getCategoriesAdmin(): Promise<AdminCategory[]> {
    const data = await api.get<ApiAdminCategory[]>("/api/admin/categories");
    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      is_active: c.is_active ?? c.isActive,
      sort_order: c.sort_order ?? c.sortOrder ?? 0,
    }));
  },

  async createCategory(payload: { name: string; slug: string; description?: string | null; is_active?: boolean }) {
    const data = await api.post<unknown>("/api/admin/categories", {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      isActive: payload.is_active ?? true,
      sortOrder: 0,
    });
    return data;
  },

  async updateCategory(id: string, patch: Partial<{ name: string; slug: string; description: string | null; is_active: boolean; sort_order: number }>) {
    const p = patch as Record<string, unknown>;
    const data = await api.put<unknown>(`/api/admin/categories/${id}`, {
      name: p["name"],
      slug: p["slug"],
      description: (p["description"] as string | null | undefined) ?? null,
      isActive: p["is_active"],
      sortOrder: (p["sort_order"] as number | undefined) ?? 0,
    });
    return data;
  },

  async deleteCategory(id: string) {
    await api.delete(`/api/admin/categories/${id}`);
  },
};
