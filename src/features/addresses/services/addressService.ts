import { api } from "@/lib/api";
import type { Tables } from "@/types/database";

export type Address = Tables<"addresses">;
export type AddressInsert = Omit<Tables<"addresses">, "id" | "created_at" | "updated_at"> & { id?: string };

type ApiAddress = {
  id: string;
  label?: string | null;
  recipientName: string;
  phone?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapAddress(a: ApiAddress): Address {
  return {
    id: a.id,
    user_id: "",
    label: a.label ?? null,
    recipient_name: a.recipientName,
    phone: a.phone ?? null,
    address_line_1: a.addressLine1,
    address_line_2: a.addressLine2 ?? null,
    city: a.city,
    state: a.state ?? null,
    postal_code: a.postalCode ?? null,
    country: a.country,
    is_default: a.isDefault,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  } as unknown as Address;
}

function toApiPayload(payload: any) {
  return {
    label: payload.label ?? null,
    recipientName: payload.recipient_name ?? payload.recipientName ?? "",
    phone: payload.phone ?? null,
    addressLine1: payload.address_line_1 ?? payload.addressLine1 ?? "",
    addressLine2: payload.address_line_2 ?? payload.addressLine2 ?? null,
    city: payload.city ?? "",
    state: payload.state ?? null,
    postalCode: payload.postal_code ?? payload.postalCode ?? null,
    country: payload.country ?? "MM",
    isDefault: payload.is_default ?? payload.isDefault ?? false,
  };
}

export const addressService = {
  async list(): Promise<Address[]> {
    try {
      const data = await api.get<ApiAddress[]>("/api/addresses");
      return (data ?? []).map(mapAddress);
    } catch (e) {
      if (e instanceof Error && e.message.includes("401")) return [];
      throw e;
    }
  },

  async create(payload: Omit<AddressInsert, "user_id">): Promise<Address> {
    const data = await api.post<ApiAddress>(
      "/api/addresses",
      toApiPayload(payload),
    );
    return mapAddress(data);
  },

  async update(id: string, payload: Partial<Omit<Address, "id" | "user_id">>): Promise<Address> {
    const data = await api.put<ApiAddress>(
      `/api/addresses/${id}`,
      toApiPayload(payload),
    );
    return mapAddress(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/addresses/${id}`);
  },

  async setDefault(id: string): Promise<void> {
    await api.patch(`/api/addresses/${id}/default`);
  },
};
