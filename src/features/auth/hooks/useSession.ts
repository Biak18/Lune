import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "@/stores/authStore";

export function useSessionQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["session", "profile"],
    queryFn: () => authService.getCurrentProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserQuery() {
  return useSessionQuery();
}
