import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import type { ProductsQueryParams } from "../types";

export const productKeys = {
  all: ["products"] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  list: (params: ProductsQueryParams) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductsQuery(params: ProductsQueryParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

export function useProductsInfiniteQuery(params: Omit<ProductsQueryParams, "page" | "pageSize"> = {}, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...productKeys.all, "infinite", params, pageSize],
    queryFn: ({ pageParam = 0 }) => productService.getProducts({ ...params, page: pageParam as number, pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.count === null) return undefined;
      const fetched = (lastPage.page + 1) * lastPage.pageSize;
      if (fetched >= lastPage.count) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProductQuery(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
}
