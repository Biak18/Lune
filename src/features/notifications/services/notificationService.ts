import { api } from "@/lib/api";
import type { Tables } from "@/types/database";

export type Notification = Tables<"notifications">;
export type NotificationPrefs = Tables<"notification_preferences">;
export type NotificationPrefsPatch = Partial<Omit<NotificationPrefs, "user_id" | "updated_at">>;

type ApiNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: string | null;
  isRead: boolean;
  createdAt: string;
};

type ApiPrefs = {
  orderUpdates: boolean;
  backInStock: boolean;
  priceDrop: boolean;
  updatedAt: string;
};

function parseData(value: string | null | undefined): Record<string, any> | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return { raw: value };
  }
}

function mapNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    user_id: "",
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    data: parseData(n.data),
    is_read: n.isRead,
    created_at: n.createdAt,
  } as unknown as Notification;
}

function mapPrefs(p: ApiPrefs): NotificationPrefs {
  return {
    user_id: "",
    order_updates: p.orderUpdates,
    back_in_stock: p.backInStock,
    price_drop: p.priceDrop,
    updated_at: p.updatedAt,
  } as unknown as NotificationPrefs;
}

function toApiPatch(patch: NotificationPrefsPatch) {
  const out: Record<string, unknown> = {};
  const p = patch as Record<string, unknown>;
  if (p.order_updates !== undefined) out.orderUpdates = p.order_updates;
  if (p.back_in_stock !== undefined) out.backInStock = p.back_in_stock;
  if (p.price_drop !== undefined) out.priceDrop = p.price_drop;
  // also accept camelCase input
  if (p.orderUpdates !== undefined) out.orderUpdates = p.orderUpdates;
  if (p.backInStock !== undefined) out.backInStock = p.backInStock;
  if (p.priceDrop !== undefined) out.priceDrop = p.priceDrop;
  return out;
}

export const notificationService = {
  async list(): Promise<Notification[]> {
    try {
      const data = await api.get<ApiNotification[]>("/api/notifications");
      return (data ?? []).map(mapNotification);
    } catch (e) {
      if (e instanceof Error && e.message.includes("401")) return [];
      throw e;
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const count = await api.get<number>("/api/notifications/unread-count");
      return typeof count === "number" ? count : 0;
    } catch {
      return 0;
    }
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.post("/api/notifications/read-all");
  },

  async createForCurrentUser(_args: { type: string; title: string; body?: string; data?: Record<string, any> }): Promise<void> {
    // No client-create endpoint on the backend — notifications are
    // created server-side (e.g. order events). Keep as no-op.
    return;
  },

  async getPrefs(): Promise<NotificationPrefs | null> {
    try {
      const data = await api.get<ApiPrefs>("/api/notification-preferences");
      return mapPrefs(data);
    } catch {
      return null;
    }
  },

  async updatePrefs(patch: NotificationPrefsPatch): Promise<NotificationPrefs> {
    const data = await api.put<ApiPrefs>(
      "/api/notification-preferences",
      toApiPatch(patch),
    );
    return mapPrefs(data);
  },
};
