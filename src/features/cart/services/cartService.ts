import { api } from "@/lib/api";
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

type ApiCartItem = {
  id: string;
  quantity: number;
  variantId: string;
  variant: {
    id: string;
    productId: string;
    sku: string;
    color?: string | null;
    size?: string | null;
    price?: number | null;
    stockQuantity: number;
    isActive: boolean;
    product?: {
      id: string;
      name: string;
      basePrice: number;
      category?: { id: string; name: string } | null;
      images: { id: string; url: string; isPrimary: boolean; sortOrder: number }[];
    } | null;
  };
  createdAt: string;
  updatedAt: string;
};

function mapCartItem(row: ApiCartItem): CartItem {
  const v = row.variant;
  const product = v.product
    ? {
        id: v.product.id,
        name: v.product.name,
        base_price: v.product.basePrice,
        category: v.product.category
          ? {
              id: v.product.category.id,
              name: v.product.category.name,
            }
          : null,
        images: (v.product.images ?? [])
          .map((i) => ({
            id: i.id,
            product_id: v.productId,
            image_url: i.url,
            alt_text: null,
            sort_order: i.sortOrder,
            is_primary: i.isPrimary,
          }))
          .sort((a, b) => {
            if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
          }),
      }
    : null;
  return {
    id: row.id,
    quantity: row.quantity,
    variant_id: row.variantId,
    variant: {
      id: v.id,
      product_id: v.productId,
      sku: v.sku,
      color: v.color ?? null,
      size: v.size ?? null,
      price: v.price ?? null,
      stock_quantity: v.stockQuantity,
      is_active: v.isActive,
      product,
    } as CartVariant,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    try {
      const data = await api.get<ApiCartItem[]>("/api/cart");
      return (data ?? []).map(mapCartItem);
    } catch (e) {
      if (e instanceof Error && e.message.includes("401")) return [];
      throw e;
    }
  },

  async addToCart(variantId: string, quantity = 1): Promise<void> {
    await api.post("/api/cart/items", { variantId, quantity });
  },

  async updateQuantity(cartItemId: string, newQuantity: number): Promise<void> {
    if (newQuantity <= 0) {
      await cartService.removeFromCart(cartItemId);
      return;
    }
    await api.patch(`/api/cart/items/${cartItemId}`, {
      quantity: newQuantity,
    });
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    await api.delete(`/api/cart/items/${cartItemId}`);
  },

  async clearCart(): Promise<void> {
    await api.delete("/api/cart");
  },
};
