import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "@/stores/authStore";

export const notifKeys = {
  all: ["notifications"] as const,
  list: () => [...notifKeys.all, "list"] as const,
  count: () => [...notifKeys.all, "count"] as const,
  prefs: () => [...notifKeys.all, "prefs"] as const,
};

export function useNotificationsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.list(),
    queryFn: () => notificationService.list(),
    enabled: !!userId,
    staleTime: 1000 * 20,
  });
}

export function useUnreadCountQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.count(),
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
      qc.invalidateQueries({ queryKey: notifKeys.list() });
      qc.invalidateQueries({ queryKey: notifKeys.count() });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.list() });
      qc.invalidateQueries({ queryKey: notifKeys.count() });
    },
  });
}

export function useNotificationPrefsQuery() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: notifKeys.prefs(),
    queryFn: () => notificationService.getPrefs(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdatePrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof notificationService.updatePrefs>[0]) => notificationService.updatePrefs(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.prefs() }),
  });
}
