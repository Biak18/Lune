import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

export function useIsAdmin() {
  const role = useAuthStore((s) => s.user?.role);
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["admin", "isAdmin", userId],
    queryFn: async () => {
      return role === "admin";
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
