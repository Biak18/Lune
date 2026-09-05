import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "@/stores/authStore";

export const notifKeys = {
  all: ["notifications"] as const,
  list: (uid?: string) => [...notifKeys.all, "list", uid ?? "anon"] as const,
  count: (uid?: string) => [...notifKeys.all, "count", uid ?? "anon"] as const,
  prefs: (uid?: string) => [...notifKeys.all, "prefs", uid ?? "anon"] as const,
};

export function useNotificationsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.list(userId),
    queryFn: () => notificationService.list(),
    enabled: !!userId,
    staleTime: 1000 * 20,
  });
}

export function useUnreadCountQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.count(userId),
    queryFn: () => notificationService.unreadCount(),
    enabled: !!userId,
    staleTime: 1000 * 15,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: notifKeys.list(uid) });
      qc.invalidateQueries({ queryKey: notifKeys.count(uid) });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: notifKeys.list(uid) });
      qc.invalidateQueries({ queryKey: notifKeys.count(uid) });
    },
  });
}

export function useNotificationPrefsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.prefs(userId),
    queryFn: () => notificationService.getPrefs(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdatePrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof notificationService.updatePrefs>[0]) => notificationService.updatePrefs(patch),
    onSuccess: () => {
      const uid = useAuthStore.getState().user?.id;
      qc.invalidateQueries({ queryKey: notifKeys.prefs(uid) });
    },
  });
}
