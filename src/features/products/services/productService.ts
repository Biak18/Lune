import { supabase } from "@/lib/supabase";
import type { PaginatedProducts, ProductsQueryParams, ProductWithRelations } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export const productService = {
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async getProducts(params: ProductsQueryParams = {}): Promise<PaginatedProducts> {
    const page = params.page ?? 0;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `,
        { count: "exact" }
      )
      .eq("is_active", params.isActive ?? true);

    if (params.categoryId) query = query.eq("category_id", params.categoryId);
    if (params.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.categorySlug)
        .maybeSingle();
      if (cat?.id) query = query.eq("category_id", cat.id);
      else
        return {
          data: [],
          count: 0,
          page,
          pageSize,
        };
    }
    // Search: name/description/style/occasion/slug + category name
    let searchIds: string[] | null = null;
    if (params.search) {
      const raw = params.search.trim();
      if (raw) {
        const s = raw.replace(/%/g, "\\%").replace(/,/g, " ");
        const orFilter = `name.ilike.%${s}%,description.ilike.%${s}%,style.ilike.%${s}%,occasion.ilike.%${s}%,slug.ilike.%${s}%`;
        const { data: catMatches } = await supabase.from("categories").select("id").ilike("name", `%${s}%`);
        const catIds = (catMatches ?? []).map((c: any) => c.id);
        const { data: orMatched } = await supabase.from("products").select("id").or(orFilter).eq("is_active", params.isActive ?? true).limit(200);
        const orIds = (orMatched ?? []).map((p: any) => p.id);
        let byCatIds: string[] = [];
        if (catIds.length) {
          const { data: byCat } = await supabase.from("products").select("id").in("category_id", catIds).eq("is_active", params.isActive ?? true).limit(200);
          byCatIds = (byCat ?? []).map((p: any) => p.id);
        }
        const union = [...new Set([...orIds, ...byCatIds])];
        searchIds = union;
        if (searchIds.length === 0) {
          return { data: [], count: 0, page, pageSize };
        }
      }
    }
    if (params.style) query = query.eq("style", params.style);
    if (params.occasion) query = query.eq("occasion", params.occasion);
    if (params.minPrice != null) query = query.gte("base_price", params.minPrice);
    if (params.maxPrice != null) query = query.lte("base_price", params.maxPrice);

    // Variant-level filters (color/size/inStock) → resolve product_ids via product_variants
    let variantIds: string[] | null = null;
    const needsVariantFilter = !!params.color || !!params.size || !!params.inStock;
    if (needsVariantFilter) {
      let vQuery = supabase.from("product_variants").select("product_id").eq("is_active", true);
      if (params.color) vQuery = vQuery.eq("color", params.color);
      if (params.size) vQuery = vQuery.eq("size", params.size);
      if (params.inStock) vQuery = vQuery.gt("stock_quantity", 0);
      const { data: vData, error: vErr } = await vQuery.limit(500);
      if (vErr) throw vErr;
      const ids = [...new Set((vData ?? []).map((r: any) => r.product_id))];
      variantIds = ids;
      if (variantIds.length === 0) {
        return { data: [], count: 0, page, pageSize };
      }
    }

    // Apply id intersections (search + variant) — intersect so all criteria satisfied
    if (searchIds !== null && variantIds !== null) {
      const setV = new Set(variantIds);
      const intersect = searchIds.filter((id) => setV.has(id));
      if (intersect.length === 0) return { data: [], count: 0, page, pageSize };
      query = query.in("id", intersect);
    } else if (searchIds !== null) {
      query = query.in("id", searchIds);
    } else if (variantIds !== null) {
      query = query.in("id", variantIds);
    }

    // Sorting
    switch (params.sort) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "price_asc":
        query = query.order("base_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("base_price", { ascending: false });
        break;
      case "top_rated":
        // Top rated requires review aggregation — fallback to newest for now;
        // proper ranking added in sorting step via reviews avg.
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const normalized = (data as unknown as ProductWithRelations[]).map((p) => ({
      ...p,
      images: [...(p.images ?? [])].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }),
    }));

    return { data: normalized, count, page, pageSize };
  },

  async getProductById(id: string): Promise<ProductWithRelations | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `
      )
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    const p = data as unknown as ProductWithRelations;
    p.images = [...(p.images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    return p;
  },

  async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `
      )
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    const p = data as unknown as ProductWithRelations;
    p.images = [...(p.images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    return p;
  },
};
