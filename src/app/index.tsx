import { BootSplash } from "@/components/ui/BootSplash";
import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized || isLoading) {
    return <BootSplash />;
  }

  // Catalog is public (ROADMAP Phase 3) everyone lands on Home tab;
  // auth is handled via Profile tab / auth screens.
  return <Redirect href={"/home" as any} />;
}
