import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/productService";
import { supabase } from "@/lib/supabase";
import type { ProductWithRelations } from "@/features/products/types";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";

export function useSimilarProducts(product: ProductWithRelations | null | undefined) {
  return useQuery({
    queryKey: ["recommendations", "similar", product?.id, product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [] as ProductWithRelations[];
      const res = await productService.getProducts({ categoryId: product.category_id, pageSize: 8 });
      return res.data.filter((p) => p.id !== product.id).slice(0, 6);
    },
    enabled: !!product?.category_id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOccasionRecommendations(occasion?: string | null, excludeId?: string) {
  return useQuery({
    queryKey: ["recommendations", "occasion", occasion, excludeId],
    queryFn: async () => {
      if (!occasion) return [] as ProductWithRelations[];
      const res = await productService.getProducts({ occasion, pageSize: 8 });
      return res.data.filter((p) => p.id !== excludeId).slice(0, 6);
    },
    enabled: !!occasion,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentlyViewedProducts(excludeId?: string) {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const filtered = excludeId ? ids.filter((id) => id !== excludeId) : ids;
  const topIds = filtered.slice(0, 8);
  return useQuery({
    queryKey: ["recommendations", "recently", topIds.join(",")],
    queryFn: async () => {
      if (!topIds.length) return [] as ProductWithRelations[];
      // Fetch via supabase in to preserve order
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
        .in("id", topIds);
      if (error) throw error;
      const map = new Map((data as any[]).map((p) => [p.id, p]));
      const ordered = topIds.map((id) => map.get(id)).filter(Boolean).map((p: any) => ({
        ...p,
        images: [...(p.images ?? [])].sort((a: any, b: any) => (a.is_primary !== b.is_primary ? (a.is_primary ? -1 : 1) : (a.sort_order ?? 0) - (b.sort_order ?? 0))),
      }));
      return ordered as ProductWithRelations[];
    },
    enabled: topIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
