import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "../services/addressService";
import type { Address } from "../services/addressService";
import { useAuthStore } from "@/stores/authStore";

export const addressKeys = {
  all: ["addresses"] as const,
  list: (uid?: string) => [...addressKeys.all, "list", uid ?? "anon"] as const,
};

export function useAddressesQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: addressKeys.list(userId),
    queryFn: () => addressService.list(),
    enabled: isAuthenticated,
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
    // Optimistic: flip the default flag in place so the badge, radio, and
    // border move instantly. List order is stable (screen sorts
    // chronologically), so cards never jump while the request is in flight.
    onMutate: async (id) => {
      const uid = useAuthStore.getState().user?.id;
      const key = addressKeys.list(uid);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Address[]>(key);
      qc.setQueryData<Address[]>(key, (old) =>
        (old ?? []).map((a) => ({ ...a, is_default: a.id === id })),
      );
      return { previous, key };
    },
    onError: (_e, _id, context) => {
      if (context?.previous) qc.setQueryData(context.key, context.previous);
    },
    onSettled: () => {
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
