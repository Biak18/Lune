import { api } from "@/lib/api";
import type {
  PaginatedProducts,
  ProductsQueryParams,
  ProductWithRelations,
} from "../types";

/**
 * Raw DTOs from DressShop.Api (camelCase).
 * GET /api/products, GET /api/products/{id}, GET /api/products/slug/{slug}
 * GET /api/categories
 */
type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiImage = {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

type ApiVariant = {
  id: string;
  productId: string;
  sku: string;
  color?: string | null;
  size?: string | null;
  price?: number | null;
  stockQuantity: number;
  isActive: boolean;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryId?: string | null;
  category?: ApiCategory | null;
  categoryName?: string | null;
  description?: string | null;
  style?: string | null;
  occasion?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ApiImage[];
  variants: ApiVariant[];
};

type ApiPaginated = {
  data: ApiProduct[];
  count: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 10;

function mapCategory(c: ApiCategory | null | undefined): any {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    image_url: c.imageUrl ?? null,
    sort_order: c.sortOrder ?? 0,
    is_active: c.isActive,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function mapProduct(p: ApiProduct): ProductWithRelations {
  const category = p.category
    ? mapCategory(p.category)
    : p.categoryName
      ? {
          id: p.categoryId ?? "",
          name: p.categoryName,
          slug: "",
          description: null,
          image_url: null,
          sort_order: 0,
          is_active: true,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        }
      : null;
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
    category,
    images: (p.images ?? [])
      .map((i) => ({
        id: i.id,
        product_id: i.productId,
        image_url: i.imageUrl,
        alt_text: i.altText ?? null,
        sort_order: i.sortOrder,
        is_primary: i.isPrimary,
        created_at: p.createdAt,
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
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    })),
  } as unknown as ProductWithRelations;
}

export const productService = {
  async getCategories() {
    const data = await api.get<ApiCategory[]>("/api/categories");
    return (data ?? []).map(mapCategory);
  },

  async getProducts(
    params: ProductsQueryParams = {},
  ): Promise<PaginatedProducts> {
    const page = params.page ?? 0;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const res = await api.get<ApiPaginated>("/api/products", {
      page,
      pageSize,
      isActive: params.isActive ?? true,
      categoryId: params.categoryId,
      categorySlug: params.categorySlug,
      search: params.search,
      style: params.style,
      occasion: params.occasion,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      color: params.color,
      size: params.size,
      inStock: params.inStock,
      sort:
        params.sort === "recommended" ? undefined : params.sort,
      ids: params.ids,
    });
    return {
      data: (res.data ?? []).map(mapProduct),
      count: res.count ?? 0,
      page: res.page ?? page,
      pageSize: res.pageSize ?? pageSize,
    };
  },

  async getProductById(id: string): Promise<ProductWithRelations | null> {
    try {
      const res = await api.get<ApiProduct>(`/api/products/${id}`);
      return mapProduct(res);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.toLowerCase().includes("not found") ||
          e.message.includes("404"))
      ) {
        return null;
      }
      throw e;
    }
  },

  async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    try {
      const res = await api.get<ApiProduct>(
        `/api/products/slug/${encodeURIComponent(slug)}`,
      );
      return mapProduct(res);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.toLowerCase().includes("not found") ||
          e.message.includes("404"))
      ) {
        return null;
      }
      throw e;
    }
  },
};
