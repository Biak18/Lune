import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "../services/addressService";
import { useAuthStore } from "@/stores/authStore";

export const addressKeys = {
  all: ["addresses"] as const,
  list: (uid?: string) => [...addressKeys.all, "list", uid ?? "anon"] as const,
};

export function useAddressesQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: addressKeys.list(userId),
    queryFn: () => addressService.list(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof addressService.create>[0]) => addressService.create(payload),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: addressKeys.list(uid) });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: addressKeys.list(uid) });
    },
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: addressKeys.list(uid) });
    },
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof addressService.update>[1] }) =>
      addressService.update(id, payload),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: addressKeys.list(uid) });
    },
  });
}
