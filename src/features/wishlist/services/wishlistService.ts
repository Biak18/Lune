import type { ProductWithRelations } from "@/features/products/types";
import { api } from "@/lib/api";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    sortOrder?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  description?: string | null;
  style?: string | null;
  occasion?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: {
    id: string;
    productId: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: {
    id: string;
    productId: string;
    sku: string;
    color?: string | null;
    size?: string | null;
    price?: number | null;
    stockQuantity: number;
    isActive: boolean;
  }[];
};

function mapProduct(p: ApiProduct): ProductWithRelations {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    base_price: p.basePrice,
    category_id: p.categoryId ?? null,
    description: p.description ?? null,
    style: p.style ?? null,
    occasion: p.occasion ?? null,
    is_active: p.isActive,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          description: p.category.description ?? null,
          image_url: p.category.imageUrl ?? null,
          sort_order: p.category.sortOrder ?? 0,
          is_active: p.category.isActive,
          created_at: p.category.createdAt,
          updated_at: p.category.updatedAt,
        }
      : null,
    images: (p.images ?? [])
      .map((i) => ({
        id: i.id,
        product_id: i.productId,
        image_url: i.imageUrl,
        alt_text: i.altText ?? null,
        sort_order: i.sortOrder,
        is_primary: i.isPrimary,
      }))
      .sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }),
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      product_id: v.productId,
      sku: v.sku,
      color: v.color ?? null,
      size: v.size ?? null,
      price: v.price ?? null,
      stock_quantity: v.stockQuantity,
      is_active: v.isActive,
    })),
  } as unknown as ProductWithRelations;
}

export const wishlistService = {
  async getWishlist(): Promise<ProductWithRelations[]> {
    try {
      const data = await api.get<ApiProduct[]>("/api/favorites");
      return (data ?? []).map(mapProduct);
    } catch (e) {
      if (e instanceof Error && e.message.includes("401")) return [];
      throw e;
    }
  },

  async getFavoriteIds(): Promise<Set<string>> {
    try {
      const ids = await api.get<string[]>("/api/favorites/ids");
      return new Set(ids ?? []);
    } catch {
      return new Set();
    }
  },

  async addFavorite(productId: string): Promise<void> {
    await api.post("/api/favorites", { productId });
  },

  async removeFavorite(productId: string): Promise<void> {
    await api.delete(`/api/favorites/${productId}`);
  },

  async isFavorite(productId: string): Promise<boolean> {
    try {
      const res = await api.get<{ isFavorite: boolean }>(
        `/api/favorites/${productId}`,
      );
      return res.isFavorite === true;
    } catch {
      return false;
    }
  },
};
