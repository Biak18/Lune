import type { Tables } from "@/types/database";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Variant = Tables<"product_variants">;
export type ProductImage = Tables<"product_images">;

export type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
  variants: Variant[];
};

export type ProductsQueryParams = {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  style?: string;
  occasion?: string;
  sort?: "recommended" | "newest" | "price_asc" | "price_desc" | "top_rated";
  isActive?: boolean;
};

export type PaginatedProducts = {
  data: ProductWithRelations[];
  count: number | null;
  page: number;
  pageSize: number;
};
