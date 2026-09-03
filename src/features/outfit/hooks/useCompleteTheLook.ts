import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/productService";
import type { ProductWithRelations } from "@/features/products/types";

export function useCompleteTheLook(product: ProductWithRelations | null | undefined) {
  const occasion = product?.occasion ?? undefined;
  const style = product?.style ?? undefined;
  const categoryId = product?.category_id ?? undefined;
  const productId = product?.id;

  return useQuery({
    queryKey: ["complete-look", productId, occasion, style, categoryId],
    queryFn: async () => {
      if (!product) return [] as ProductWithRelations[];
      // Prefer same occasion, fallback to same style, exclude current product
      let data = await productService.getProducts({ occasion, style, pageSize: 20 });
      let filtered = data.data
        .filter((p) => p.id !== product.id)
        .filter((p) => !categoryId || p.category_id !== categoryId);

      // If too few, fallback to same style only
      if (filtered.length < 4 && style) {
        const byStyle = await productService.getProducts({ style, pageSize: 20 });
        const extra = byStyle.data.filter((p) => p.id !== product.id && !filtered.find((f) => f.id === p.id) && p.category_id !== categoryId);
        filtered = [...filtered, ...extra].slice(0, 6);
      }
      // If still few, fallback to same occasion only
      if (filtered.length < 4 && occasion) {
        const byOcc = await productService.getProducts({ occasion, pageSize: 20 });
        const extra = byOcc.data.filter((p) => p.id !== product.id && !filtered.find((f) => f.id === p.id) && p.category_id !== categoryId);
        filtered = [...filtered, ...extra].slice(0, 6);
      }
      return filtered.slice(0, 6);
    },
    enabled: !!product?.id,
    staleTime: 1000 * 60 * 2,
  });
}
