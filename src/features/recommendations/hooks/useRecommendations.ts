import { productService } from "@/features/products/services/productService";
import type { ProductWithRelations } from "@/features/products/types";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import { useQuery } from "@tanstack/react-query";

export function useSimilarProducts(
  product: ProductWithRelations | null | undefined,
) {
  return useQuery({
    queryKey: ["recommendations", "similar", product?.id, product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [] as ProductWithRelations[];
      const res = await productService.getProducts({
        categoryId: product.category_id,
        pageSize: 8,
      });
      return res.data.filter((p) => p.id !== product.id).slice(0, 6);
    },
    enabled: !!product?.category_id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOccasionRecommendations(
  occasion?: string | null,
  excludeId?: string,
) {
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
      if (!topIds.length) {
        return [] as ProductWithRelations[];
      }

      const res = await productService.getProducts({
        ids: topIds,
        pageSize: topIds.length,
      });

      const map = new Map(res.data.map((product) => [product.id, product]));

      // Restore recently-viewed order
      return topIds
        .map((id) => map.get(id))
        .filter(
          (product): product is ProductWithRelations => product !== undefined,
        );
    },

    enabled: topIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
