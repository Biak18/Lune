import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Notification = Tables<"notifications">;
export type NotificationPrefs = Tables<"notification_preferences">;

export const notificationService = {
  async list(): Promise<Notification[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async unreadCount(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return 0;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw error;
    return count ?? 0;
  },

  async markRead(id: string): Promise<void> {
    const { error } = await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
    if (error) throw error;
  },

  async markAllRead(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("notifications").update({ is_read: true } as any).eq("user_id", userId).eq("is_read", false);
    if (error) throw error;
  },

  async createForCurrentUser(args: { type: Notification["type"]; title: string; body?: string; data?: Record<string, any> }): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type: args.type,
      title: args.title,
      body: args.body ?? null,
      data: args.data ?? null,
    } as any);
    if (error) throw error;
  },

  async getPrefs(): Promise<NotificationPrefs | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (!data) {
      // create defaults
      const { data: created, error: cErr } = await supabase
        .from("notification_preferences")
        .insert({ user_id: userId } as any)
        .select()
        .single();
      if (cErr) throw cErr;
      return created as NotificationPrefs;
    }
    return data as NotificationPrefs;
  },

  async updatePrefs(patch: Partial<Omit<NotificationPrefs, "user_id" | "updated_at">>): Promise<NotificationPrefs> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    const { data, error } = await supabase
      .from("notification_preferences")
      .update({ ...patch, updated_at: new Date().toISOString() } as any)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as NotificationPrefs;
  },
};
