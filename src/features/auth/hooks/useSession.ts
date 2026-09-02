import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authService.getSession(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserQuery() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authService.getUser(),
    staleTime: 1000 * 60 * 5,
  });
}
