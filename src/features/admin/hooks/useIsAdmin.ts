import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export function useIsAdmin() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["admin", "isAdmin", userId],
    queryFn: async () => {
      if (!userId) return false;
      // Prefer profile role (cached via RLS) but also verify via is_admin RPC
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if ((profile as any)?.role === "admin") return true;
      const { data, error } = await supabase.rpc("is_admin" as any);
      if (error) return false;
      return !!data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
