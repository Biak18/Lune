import type { CartItem } from "@/features/cart/services/cartService";
import { api } from "@/lib/api";
import type { Tables } from "@/types/database";

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

type ApiOrderItem = {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  productName: string;
  variantDescription?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type ApiOrder = {
  id: string;
  status: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  shippingAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
};

function parseAddress(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, any>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }
  return {};
}

function mapOrder(o: ApiOrder): Order & { items?: OrderItem[] } {
  return {
    id: o.id,
    user_id: "",
    status: o.status,
    subtotal: o.subtotal,
    shipping_amount: o.shippingAmount,
    discount_amount: o.discountAmount,
    total: o.total,
    shipping_address: parseAddress(o.shippingAddress),
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    items: (o.items ?? []).map((i) => ({
      id: i.id,
      order_id: o.id,
      product_id: i.productId ?? null,
      variant_id: i.variantId ?? null,
      product_name: i.productName,
      variant_description: i.variantDescription ?? null,
      unit_price: i.unitPrice,
      quantity: i.quantity,
    })),
  } as unknown as Order & { items: OrderItem[] };
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const data = await api.get<ApiOrder[]>("/api/orders");
      return (data ?? []).map((o) => mapOrder(o) as Order);
    } catch (e) {
      if (e instanceof Error && e.message.includes("401")) return [];
      throw e;
    }
  },

  async getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    try {
      const order = await api.get<ApiOrder>(`/api/orders/${id}`);
      return mapOrder(order) as Order & { items: OrderItem[] };
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.toLowerCase().includes("not found") ||
          e.message.includes("404"))
      ) {
        return null;
      }
      throw e;
    }
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await api.post<ApiOrder>(`/api/orders/${orderId}/cancel`);
    return mapOrder(order) as Order;
  },

  /**
   * Server-trusted creation: backend resolves live prices, validates stock,
   * snapshots items, clears cart. Client only sends variant+quantity.
   */
  async createOrder(args: {
    cartItems: CartItem[];
    shippingAddress: Record<string, any>;
  }): Promise<Order> {
    if (!args.cartItems.length) throw new Error("Your bag is empty");
    const sa = args.shippingAddress ?? {};
    const shippingAddress = {
      addressLine1:
        sa.address_line_1 ?? sa.addressLine1 ?? sa.address_line1 ?? "",
      addressLine2:
        sa.address_line_2 ?? sa.addressLine2 ?? sa.address_line2 ?? null,
      city: sa.city ?? "",
      state: sa.state ?? null,
      postalCode: sa.postal_code ?? sa.postalCode ?? null,
      country: sa.country ?? "MM",
      phone: sa.phone ?? null,
    };
    if (!shippingAddress.addressLine1) {
      throw new Error("Shipping address required");
    }
    const order = await api.post<ApiOrder>("/api/orders", {
      items: args.cartItems.map((it) => ({
        variantId: it.variant_id,
        quantity: it.quantity,
      })),
      shippingAddress,
    });
    return mapOrder(order) as Order;
  },
};
