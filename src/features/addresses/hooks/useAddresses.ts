import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "../services/addressService";
import { useAuthStore } from "@/stores/authStore";

export const addressKeys = {
  all: ["addresses"] as const,
  list: () => [...addressKeys.all, "list"] as const,
};

export function useAddressesQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: () => addressService.list(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof addressService.create>[0]) => addressService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.list() }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.list() }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.list() }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof addressService.update>[1] }) =>
      addressService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.list() }),
  });
}
